import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  registerUnauthorizedSessionListener,
  resetUnauthorizedSessionForTests,
} from "@/services/api/unauthorized-session";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getCurrentUser session probe", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetUnauthorizedSessionForTests();
  });

  it("returns null on 401 and synchronizes session once", async () => {
    const listener = vi.fn();
    registerUnauthorizedSessionListener(listener);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(401, {
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        }),
      ),
    );

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
