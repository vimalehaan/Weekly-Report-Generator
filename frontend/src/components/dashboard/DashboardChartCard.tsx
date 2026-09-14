import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardChartCard({
  title,
  description,
  children,
  className,
}: DashboardChartCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
