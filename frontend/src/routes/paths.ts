export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
