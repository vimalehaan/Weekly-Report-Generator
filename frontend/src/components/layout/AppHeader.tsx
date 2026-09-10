import { APP_NAME } from "@/constants/app";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </p>
      </div>
    </header>
  );
}
