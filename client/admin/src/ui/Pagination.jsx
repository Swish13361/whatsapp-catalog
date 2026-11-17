export function Pagination({ page, pages, onPageChange, className }) {
  if (pages < 2) return null;
  return (
    <nav className={`flex items-center gap-1 border-t border-line px-4 py-3 text-sm ${className || ""}`}>
      <span className="text-muted">Page {page} of {pages}</span>
      <div className="flex gap-1 ml-auto">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded border border-line bg-surface text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded border border-line bg-surface text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          Next
        </button>
      </div>
    </nav>
  );
}


