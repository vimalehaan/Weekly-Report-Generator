import { describe, expect, it, vi } from "vitest";
import {
  dispatchUnauthorizedSession,
  registerUnauthorizedSessionListener,
  resetUnauthorizedSessionForTests,
} from "@/services/api/unauthorized-session";

describe("unauthorized-session", () => {
  it("invokes the registered listener on dispatch", () => {
    resetUnauthorizedSessionForTests();
    const listener = vi.fn();
    registerUnauthorizedSessionListener(listener);

    dispatchUnauthorizedSession();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not recurse when the listener triggers another dispatch", () => {
    resetUnauthorizedSessionForTests();
    const listener = vi.fn(() => {
      dispatchUnauthorizedSession();
    });
    registerUnauthorizedSessionListener(listener);

    dispatchUnauthorizedSession();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("no-ops when no listener is registered", () => {
    resetUnauthorizedSessionForTests();
    expect(() => dispatchUnauthorizedSession()).not.toThrow();
  });
});
