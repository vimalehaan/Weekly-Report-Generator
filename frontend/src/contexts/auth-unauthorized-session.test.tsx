import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { dispatchUnauthorizedSession } from "@/services/api/unauthorized-session";
import type { User } from "@/types/auth";

const mockUser: User = {
  id: "user-1",
  firstName: "Alex",
  lastName: "Jordan",
  email: "alex@example.com",
  role: "TEAM_MEMBER",
  isActive: true,
};

vi.mock("@/services/auth", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

import * as authService from "@/services/auth";

function AuthProbe() {
  const { isAuthenticated, status } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
    </div>
  );
}

describe("AuthProvider unauthorized session sync", () => {
  beforeEach(() => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  });

  it("clears authenticated state when a protected API returns 401", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    dispatchUnauthorizedSession();

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
    });
  });
});
