import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { clearAccessTokenCookie } from "../utils/cookie.js";
import { verifyAccessToken } from "../utils/jwt.js";

const unauthorizedResponse = {
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
  },
} as const;

const inactiveAccountResponse = {
  error: {
    code: "UNAUTHORIZED",
    message: "Account is inactive",
  },
} as const;

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.accessToken;

  if (typeof token !== "string" || token.length === 0) {
    res.status(401).json(unauthorizedResponse);
    return;
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401).json(unauthorizedResponse);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true },
  });

  if (!user || !user.isActive) {
    clearAccessTokenCookie(res);
    res.status(401).json(inactiveAccountResponse);
    return;
  }

  req.user = payload;
  next();
}
