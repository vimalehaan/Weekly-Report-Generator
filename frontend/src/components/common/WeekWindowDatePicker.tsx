import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClassName } from "@/components/common/FormField";
import {
  computeWeekEndFromWeekStart,
  formatIsoWeekWindow,
  getMondayOfReportingWeek,
  getMonthCalendarGrid,
  isDateInReportingWeek,
  isIsoDateString,
  isMondayWeekStart,
  parseIsoDateParts,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export type WeekWindowDatePickerProps = {
  id: string;
  value: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
};

function getInitialViewMonth(value: string): { year: number; month: number } {
  const parsed = parseIsoDateParts(value);
  if (parsed) {
    return { year: parsed.year, month: parsed.month };
  }

  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function WeekWindowDatePicker({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  invalid = false,
}: WeekWindowDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [{ year, month }, setViewMonth] = useState(() =>
    getInitialViewMonth(value),
  );
  const [hoverIso, setHoverIso] = useState<string | null>(null);

  useEffect(() => {
    if (isIsoDateString(value)) {
      const parsed = parseIsoDateParts(value);
      if (parsed) {
        setViewMonth({ year: parsed.year, month: parsed.month });
      }
    }
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const grid = useMemo(
    () => getMonthCalendarGrid(year, month),
    [year, month],
  );

  const activeWeekStart =
    hoverIso ??
    (isMondayWeekStart(value) ? value : getMondayOfReportingWeek(value));

  const monthLabel = monthYearFormatter.format(
    new Date(Date.UTC(year, month - 1, 1)),
  );

  function openPicker() {
    if (!disabled) {
      setOpen(true);
    }
  }

  function goToPreviousMonth() {
    setViewMonth((current) => {
      if (current.month === 1) {
        return { year: current.year - 1, month: 12 };
      }

      return { year: current.year, month: current.month - 1 };
    });
  }

  function goToNextMonth() {
    setViewMonth((current) => {
      if (current.month === 12) {
        return { year: current.year + 1, month: 1 };
      }

      return { year: current.year, month: current.month + 1 };
    });
  }

  function selectDate(isoDate: string) {
    onChange(isoDate);
    setHoverIso(null);
    setOpen(false);
  }

  function handleInputBlur() {
    onBlur?.();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder="YYYY-MM-DD"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onClick={openPicker}
          onFocus={openPicker}
          onBlur={handleInputBlur}
          className={cn(formInputClassName(invalid), "pr-10 tabular-nums")}
          aria-invalid={invalid}
          aria-expanded={open}
          aria-haspopup="dialog"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label="Open calendar"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          <CalendarDays className="size-4" />
        </Button>
      </div>

      {open ? (
        <div
          className="absolute z-50 mt-1 w-full min-w-[min(100%,20rem)] rounded-lg border border-border bg-card p-3 shadow-lg"
          role="dialog"
          aria-label="Choose week start date"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">{monthLabel}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              const isSelectable = isMondayWeekStart(cell.isoDate);
              const weekStartForCell = getMondayOfReportingWeek(cell.isoDate);
              const inWeek =
                activeWeekStart !== null &&
                isDateInReportingWeek(cell.isoDate, activeWeekStart);
              const isStart =
                activeWeekStart !== null && cell.isoDate === activeWeekStart;
              const isEnd =
                activeWeekStart !== null &&
                cell.isoDate === computeWeekEndFromWeekStart(activeWeekStart);
              const isSelected = value === cell.isoDate;

              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  aria-disabled={!isSelectable}
                  tabIndex={isSelectable ? 0 : -1}
                  onMouseEnter={() => {
                    if (weekStartForCell) {
                      setHoverIso(weekStartForCell);
                    }
                  }}
                  onMouseLeave={() => setHoverIso(null)}
                  onClick={() => {
                    if (isSelectable) {
                      selectDate(cell.isoDate);
                    }
                  }}
                  className={cn(
                    "h-9 rounded-md text-sm tabular-nums transition-colors",
                    !cell.inCurrentMonth && "text-muted-foreground/70",
                    !isSelectable && !inWeek && "cursor-not-allowed opacity-40",
                    !isSelectable && inWeek && "cursor-default",
                    inWeek && !isStart && !isEnd && "bg-primary/15",
                    isStart &&
                      "bg-primary font-semibold text-primary-foreground",
                    isEnd &&
                      !isStart &&
                      "bg-primary/30 font-medium text-foreground",
                    isSelectable &&
                      isSelected &&
                      !isStart &&
                      "ring-1 ring-primary ring-offset-1 ring-offset-background",
                    isSelectable &&
                      !inWeek &&
                      "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  )}
                >
                  {parseIsoDateParts(cell.isoDate)?.day}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {activeWeekStart ? (
              <>
                Reporting week:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {formatIsoWeekWindow(activeWeekStart)}
                </span>
              </>
            ) : (
              "Choose a Monday to start the reporting week (Mon–Sun)."
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
