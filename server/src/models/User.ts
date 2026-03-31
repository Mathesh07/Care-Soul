import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'superadmin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface IUserSession {
  sessionId: string;
  refreshTokenId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

export interface IUserRefreshToken {
  tokenId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  revokedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
  mfaEnabled: boolean;
  mfaSecret?: string;
  refreshTokens: IUserRefreshToken[];
  sessions: IUserSession[];
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IUserRefreshToken>(
  {
    tokenId: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    revokedAt: { type: Date },
  },
  { _id: false }
);

const sessionSchema = new Schema<IUserSession>(
  {
    sessionId: { type: String, required: true },
    refreshTokenId: { type: String, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'superadmin'],
      default: 'patient',
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification'],
      default: 'pending_verification',
      required: true,
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    sessions: { type: [sessionSchema], default: [] },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
