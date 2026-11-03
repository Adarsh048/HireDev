import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { JwtPayload } from '../middlewares/auth';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Hashes a password using Argon2id
   */
  public static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a password against an Argon2id hash
   */
  public static async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  /**
   * Generates Access and Refresh JWTs
   */
  public static generateTokens(user: IUser): AuthTokens {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user account
   */
  public static async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await this.hashPassword(input.password);
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role: 'candidate',
    });

    const tokens = this.generateTokens(user);
    return { user, tokens };
  }

  /**
   * Authenticates user credentials
   */
  public static async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isValid = await this.verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user);
    return { user, tokens };
  }

  /**
   * Refreshes JWT tokens using a valid refresh token
   */
  public static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw ApiError.unauthorized('User no longer exists');
      }

      return this.generateTokens(user);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }
}
