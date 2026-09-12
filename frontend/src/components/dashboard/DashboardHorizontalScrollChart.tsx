import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_CHART_HEIGHT = 320;
const DEFAULT_MIN_WIDTH_PER_ITEM = 72;

type DashboardHorizontalScrollChartProps = {
  itemCount: number;
  minWidthPerItem?: number;
  height?: number;
  scrollAriaLabel: string;
  className?: string;
  children: ReactNode;
};

export function DashboardHorizontalScrollChart({
  itemCount,
  minWidthPerItem = DEFAULT_MIN_WIDTH_PER_ITEM,
  height = DEFAULT_CHART_HEIGHT,
  scrollAriaLabel,
  className,
  children,
}: DashboardHorizontalScrollChartProps) {
  const scrollContentWidth = Math.max(itemCount, 1) * minWidthPerItem;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="w-full overflow-x-auto overscroll-x-contain rounded-md [-ms-overflow-style:auto] [scrollbar-width:thin]"
        style={{ height }}
        tabIndex={0}
        role="region"
        aria-label={scrollAriaLabel}
      >
        <div
          className="h-full min-w-full"
          style={{ width: `max(100%, ${scrollContentWidth}px)` }}
        >
          {children}
        </div>
      </div>
      {itemCount > 6 ? (
        <p className="text-xs text-muted-foreground">
          Scroll horizontally to view all {itemCount} items.
        </p>
      ) : null}
    </div>
  );
}
