import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api/api-error";
import { apiRequest } from "@/services/api/client";
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

describe("apiRequest unauthorized handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetUnauthorizedSessionForTests();
  });

  it("dispatches session sync and throws ApiError on 401", async () => {
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

    await expect(apiRequest("/api/v1/reports")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    } satisfies Partial<ApiError>);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not dispatch session sync for non-401 errors", async () => {
    const listener = vi.fn();
    registerUnauthorizedSessionListener(listener);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(403, {
          error: { code: "FORBIDDEN", message: "Forbidden" },
        }),
      ),
    );

    await expect(apiRequest("/api/v1/reports")).rejects.toMatchObject({
      status: 403,
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it("still throws ApiError for 404, 409, and 422 without dispatch", async () => {
    const listener = vi.fn();
    registerUnauthorizedSessionListener(listener);

    for (const status of [404, 409, 422] as const) {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          jsonResponse(status, {
            error: { code: "ERROR", message: "Failure" },
          }),
        ),
      );

      await expect(apiRequest("/api/v1/reports")).rejects.toMatchObject({
        status,
      });
    }

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("apiRequest /me 401", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetUnauthorizedSessionForTests();
  });

  it("dispatches once per failed /me request without follow-up calls", async () => {
    const listener = vi.fn();
    registerUnauthorizedSessionListener(listener);
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(401, {
        error: { code: "UNAUTHORIZED", message: "Account is inactive" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/api/v1/auth/me")).rejects.toMatchObject({
      status: 401,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
