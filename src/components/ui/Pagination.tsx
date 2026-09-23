"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
      <p className="min-w-0 text-xs text-muted-foreground">
        {total} total &middot; Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors duration-300 hover:bg-background hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors duration-300 hover:bg-background hover:text-foreground disabled:opacity-30"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
