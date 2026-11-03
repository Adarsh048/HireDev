import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.register(req.body);

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.login(req.body);

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const tokens = await AuthService.refreshTokens(token);

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { tokens },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});

