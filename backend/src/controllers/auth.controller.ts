import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { clearAccessTokenCookie, setAccessTokenCookie } from "../utils/cookie.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user, accessToken } = await authService.login(req.body);

    setAccessTokenCookie(res, accessToken);

    res.status(200).json({ data: { user } });
  } catch (error) {
    next(error);
  }
}

export function logout(_req: Request, res: Response): void {
  clearAccessTokenCookie(res);

  res.status(200).json({
    data: {
      message: "Logged out successfully",
    },
  });
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.status(200).json({ data: { user } });
  } catch (error) {
    next(error);
  }
}
