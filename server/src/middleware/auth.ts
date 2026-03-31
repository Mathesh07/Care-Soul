import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type Role = 'patient' | 'doctor' | 'admin' | 'superadmin';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: Role;
  type?: 'access' | 'refresh';
  sessionId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    sessionId?: string;
  };
}

/** Verify Bearer access token and attach authenticated user context to request. */
export const verifyAccessToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Missing or invalid authorization header.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as AccessTokenPayload;

    if (!decoded?.sub || !decoded?.role) {
      res.status(401).json({ success: false, message: 'Invalid access token payload.' });
      return;
    }

    if (decoded.type && decoded.type !== 'access') {
      res.status(401).json({ success: false, message: 'Invalid token type for this endpoint.' });
      return;
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (_error) {
    res.status(401).json({ success: false, message: 'Access token verification failed.' });
  }
};

/** Restrict route access to users with one of the allowed roles. */
export const authorize =
  (...roles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient role permissions.' });
      return;
    }

    next();
  };

/** Ensure the current user owns the targeted resource (by userId-like field). */
export const requireOwnership =
  (resourceField: string) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const fromBody = (req.body as Record<string, unknown> | undefined)?.[resourceField];
    const fromParams = (req.params as Record<string, string | undefined> | undefined)?.[resourceField];

    let targetOwnerId: string | undefined;

    if (typeof fromBody === 'string') {
      targetOwnerId = fromBody;
    } else if (typeof fromParams === 'string') {
      targetOwnerId = fromParams;
    } else if (fromBody && typeof fromBody === 'object') {
      const nested = fromBody as Record<string, unknown>;
      if (typeof nested.userId === 'string') targetOwnerId = nested.userId;
      if (typeof nested.ownerId === 'string') targetOwnerId = nested.ownerId;
      if (typeof nested.id === 'string') targetOwnerId = nested.id;
    }

    if (!targetOwnerId) {
      res.status(400).json({ success: false, message: `Could not resolve ownership field: ${resourceField}.` });
      return;
    }

    if (targetOwnerId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Ownership validation failed.' });
      return;
    }

    next();
  };
