import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ROUTES } from "@/routes/paths";
import { apiRequest } from "@/services/api/client";
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

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ProtectedReportsProbe() {
  useEffect(() => {
    void apiRequest("/api/v1/reports").catch(() => {
      /* expected 401; session sync + redirect are asserted on the router */
    });
  }, []);

  return <div>My Reports probe</div>;
}

function LoginFromProbe() {
  const location = useLocation();
  return (
    <div data-testid="login-from">
      {(location.state as { from?: string } | null)?.from ?? ""}
    </div>
  );
}

describe("401 session integration", () => {
  beforeEach(() => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to login with state.from when a protected apiRequest returns 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(401, {
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        }),
      ),
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/member/reports"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route
                path="/member/reports"
                element={<ProtectedReportsProbe />}
              />
            </Route>
            <Route
              path={ROUTES.login}
              element={
                <>
                  <div>Login page</div>
                  <LoginFromProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Login page")).toBeInTheDocument();
      expect(screen.getByTestId("login-from")).toHaveTextContent(
        "/member/reports",
      );
    });
  });
});
