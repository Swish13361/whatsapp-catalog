export function Pagination({ page, pages, onPageChange, className }) {
  if (pages < 2) return null;
  return (
    <nav className={`flex items-center justify-between border-t border-line px-4 py-3 text-sm ${className || ""}`} aria-label="Pagination">
      <span className="text-muted text-xs">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center justify-center h-10 px-3 min-w-[40px] rounded-lg border border-line bg-surface text-xs font-bold text-text disabled:opacity-40 disabled:pointer-events-none hover:bg-accent-soft active:bg-line/40 transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center justify-center h-10 px-3 min-w-[40px] rounded-lg border border-line bg-surface text-xs font-bold text-text disabled:opacity-40 disabled:pointer-events-none hover:bg-accent-soft active:bg-line/40 transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
        >
          Next
        </button>
      </div>
    </nav>
  );
}


