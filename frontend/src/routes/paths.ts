export const ROUTES = {
  home: "/",
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
