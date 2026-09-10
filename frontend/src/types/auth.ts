export const ROLE_NAMES = ["TEAM_MEMBER", "MANAGER"] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  isActive: boolean;
};

export type AuthUserResponse = {
  data: {
    user: User;
  };
};

export type LogoutResponse = {
  data: {
    message: string;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
