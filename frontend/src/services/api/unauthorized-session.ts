/** Clears client auth state when any API call receives 401 (no React imports). */

export type UnauthorizedSessionListener = () => void;

let listener: UnauthorizedSessionListener | null = null;
let isDispatching = false;

export function registerUnauthorizedSessionListener(
  next: UnauthorizedSessionListener | null,
): void {
  listener = next;
}

export function dispatchUnauthorizedSession(): void {
  if (isDispatching || listener === null) {
    return;
  }

  isDispatching = true;

  try {
    listener();
  } finally {
    isDispatching = false;
  }
}

/** Test-only reset. */
export function resetUnauthorizedSessionForTests(): void {
  listener = null;
  isDispatching = false;
}
