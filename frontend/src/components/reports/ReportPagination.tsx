import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/report";

type ReportPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function ReportPagination({
  pagination,
  onPageChange,
  disabled = false,
}: ReportPaginationProps) {
  const { page, totalPages, total } = pagination;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalPages === 0;

  if (total === 0) {
    return null;
  }

  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Report list pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)} · {total} report
        {total === 1 ? "" : "s"} total
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
