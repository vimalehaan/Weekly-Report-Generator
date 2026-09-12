import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ROUTES } from "@/routes/paths";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

function LoginLocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="login-from">
      {(location.state as { from?: string } | null)?.from ?? ""}
    </div>
  );
}

describe("ProtectedRoute after session loss", () => {
  it("redirects to login and preserves the current path in location state", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      status: "unauthenticated",
      isAuthenticated: false,
      isInitializing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/member/reports"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/member/reports" element={<div>Reports</div>} />
          </Route>
          <Route
            path={ROUTES.login}
            element={
              <>
                <div>Login page</div>
                <LoginLocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.getByTestId("login-from")).toHaveTextContent("/member/reports");
  });
});
