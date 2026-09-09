import type { CookieOptions } from "express";
import { env } from "../config/env.js";

const ACCESS_TOKEN_COOKIE = "accessToken";

function jwtExpiresInToMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());

  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2]!.toLowerCase();

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
}

function getBaseCookieOptions(): Pick<
  CookieOptions,
  "httpOnly" | "secure" | "sameSite"
> {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "strict" : "lax",
  };
}

export function setAccessTokenCookie(
  res: { cookie: (name: string, value: string, options: CookieOptions) => void },
  token: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...getBaseCookieOptions(),
    maxAge: jwtExpiresInToMs(env.jwtExpiresIn),
  });
}

export function clearAccessTokenCookie(
  res: { clearCookie: (name: string, options: CookieOptions) => void },
): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getBaseCookieOptions());
}
