import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Redis from 'ioredis';
import User, { IUser, UserRole } from '../../models/User';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 30 * 60 * 1000;
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  return redisClient;
}

async function redisSetWithTtl(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (redis.status !== 'ready') {
      await redis.connect();
    }
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    // Redis is optional fallback for this phase; do not block auth flow.
  }
}

async function redisGet(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    if (redis.status !== 'ready') {
      await redis.connect();
    }
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function redisDel(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (redis.status !== 'ready') {
      await redis.connect();
    }
    await redis.del(key);
  } catch {
    // no-op
  }
}

function getAccessSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return secret;
}

function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || getAccessSecret();
}

function getCookieSecureFlag(): boolean {
  return process.env.NODE_ENV === 'production';
}

function signAccessToken(user: IUser, sessionId: string): string {
  return jwt.sign(
    {
      role: user.role,
      type: 'access',
      sessionId,
    },
    getAccessSecret(),
    {
      subject: user._id.toString(),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function signRefreshToken(user: IUser, tokenId: string, sessionId: string): string {
  return jwt.sign(
    {
      role: user.role,
      type: 'refresh',
      sid: sessionId,
    },
    getRefreshSecret(),
    {
      jwtid: tokenId,
      subject: user._id.toString(),
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
}

function getClientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length > 0) return xff[0];
  return req.socket.remoteAddress || 'unknown';
}

function safeUserPayload(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    accountStatus: user.accountStatus,
    mfaEnabled: user.mfaEnabled,
  };
}

async function persistRefreshToken(tokenId: string, userId: string): Promise<void> {
  await redisSetWithTtl(`auth:refresh:${tokenId}`, userId, REFRESH_TTL_SECONDS);
}

async function blacklistRefreshToken(tokenId: string): Promise<void> {
  await redisSetWithTtl(`auth:blacklist:${tokenId}`, '1', REFRESH_TTL_SECONDS);
}

async function isRefreshBlacklisted(tokenId: string): Promise<boolean> {
  return (await redisGet(`auth:blacklist:${tokenId}`)) === '1';
}

/** Register a user account with strong password hashing and default patient role. */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account already exists for this email.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'patient',
      isEmailVerified: false,
      accountStatus: 'pending_verification',
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: safeUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Login with lockout protection and rotate refresh session token in httpOnly cookie. */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +mfaSecret');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts.',
        data: { lockedUntil: user.lockedUntil },
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_WINDOW_MS);
      }

      await user.save();
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended.' });
      return;
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();

    const tokenId = randomUUID();
    const sessionId = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

    const accessToken = signAccessToken(user, sessionId);
    const refreshToken = signRefreshToken(user, tokenId, sessionId);

    user.refreshTokens.push({
      tokenId,
      createdAt: new Date(),
      expiresAt: refreshExpiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req),
    });

    user.sessions.push({
      sessionId,
      refreshTokenId: tokenId,
      createdAt: new Date(),
      expiresAt: refreshExpiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req),
    });

    await user.save();
    await persistRefreshToken(tokenId, user._id.toString());

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: getCookieSecureFlag(),
      sameSite: 'lax',
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        user: safeUserPayload(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Refresh access token using rotating refresh token from httpOnly cookie. */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ||
      (req.body?.refreshToken as string | undefined);

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is missing.' });
      return;
    }

    let decoded: JwtPayload & { role?: UserRole; sid?: string; type?: string };
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret()) as JwtPayload & {
        role?: UserRole;
        sid?: string;
        type?: string;
      };
    } catch {
      res.status(401).json({ success: false, message: 'Refresh token is invalid or expired.' });
      return;
    }

    const userId = decoded.sub;
    const tokenId = decoded.jti;
    const sessionId = decoded.sid;

    if (!userId || !tokenId || !sessionId || decoded.type !== 'refresh') {
      res.status(401).json({ success: false, message: 'Invalid refresh token payload.' });
      return;
    }

    if (await isRefreshBlacklisted(tokenId)) {
      res.status(401).json({ success: false, message: 'Refresh token has been revoked.' });
      return;
    }

    const redisOwner = await redisGet(`auth:refresh:${tokenId}`);
    if (redisOwner && redisOwner !== userId) {
      res.status(401).json({ success: false, message: 'Refresh token ownership mismatch.' });
      return;
    }

    const user = await User.findById(userId).select('+passwordHash +mfaSecret');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const existingToken = user.refreshTokens.find((item) => item.tokenId === tokenId && !item.revokedAt);
    if (!existingToken) {
      res.status(401).json({ success: false, message: 'Refresh session not found.' });
      return;
    }

    existingToken.revokedAt = new Date();
    const oldSession = user.sessions.find((item) => item.sessionId === sessionId && !item.revokedAt);
    if (oldSession) {
      oldSession.revokedAt = new Date();
    }

    const nextTokenId = randomUUID();
    const nextSessionId = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

    const accessToken = signAccessToken(user, nextSessionId);
    const nextRefreshToken = signRefreshToken(user, nextTokenId, nextSessionId);

    user.refreshTokens.push({
      tokenId: nextTokenId,
      createdAt: new Date(),
      expiresAt: refreshExpiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req),
    });

    user.sessions.push({
      sessionId: nextSessionId,
      refreshTokenId: nextTokenId,
      createdAt: new Date(),
      expiresAt: refreshExpiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req),
    });

    await user.save();
    await blacklistRefreshToken(tokenId);
    await redisDel(`auth:refresh:${tokenId}`);
    await persistRefreshToken(nextTokenId, user._id.toString());

    res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, {
      httpOnly: true,
      secure: getCookieSecureFlag(),
      sameSite: 'lax',
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed.',
      data: {
        accessToken,
        user: safeUserPayload(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Logout by revoking refresh token and clearing session cookie. */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ||
      (req.body?.refreshToken as string | undefined);

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, getRefreshSecret()) as JwtPayload;
        const tokenId = decoded.jti;
        const userId = decoded.sub;

        if (tokenId) {
          await blacklistRefreshToken(tokenId);
          await redisDel(`auth:refresh:${tokenId}`);
        }

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.refreshTokens = user.refreshTokens.map((item) => {
              if (item.tokenId === tokenId && !item.revokedAt) {
                return { ...item, revokedAt: new Date() };
              }
              return item;
            });

            user.sessions = user.sessions.map((item) => {
              if (item.refreshTokenId === tokenId && !item.revokedAt) {
                return { ...item, revokedAt: new Date() };
              }
              return item;
            });

            await user.save();
          }
        }
      } catch {
        // Ignore invalid token on logout and still clear cookie.
      }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: getCookieSecureFlag(),
      sameSite: 'lax',
    });

    res.status(200).json({ success: true, message: 'Logout successful.' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
