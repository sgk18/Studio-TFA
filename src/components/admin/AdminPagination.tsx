import Link from "next/link";

type AdminPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  query,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={toHref({ basePath, query, page: previousPage })}
          aria-disabled={currentPage <= 1}
          className={`action-pill-link px-4 py-2 text-xs ${
            currentPage <= 1 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Previous
        </Link>

        <Link
          href={toHref({ basePath, query, page: nextPage })}
          aria-disabled={currentPage >= totalPages}
          className={`action-pill-link px-4 py-2 text-xs ${
            currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

function toHref({
  basePath,
  query,
  page,
}: {
  basePath: string;
  query?: Record<string, string | undefined>;
  page: number;
}) {
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string" && value.length > 0 && key !== "page") {
        params.set(key, value);
      }
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString.length > 0 ? `${basePath}?${queryString}` : basePath;
}
