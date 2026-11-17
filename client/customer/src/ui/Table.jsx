export function Table({ columns, rows, className, caption }) {
  return (
    <div className={`overflow-x-auto border border-line rounded-lg shadow-sm ${className || ""}`}>
      <table className="border-collapse w-full text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b border-line bg-surface/50 px-3 py-3 text-xs font-bold text-muted uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, rowIndex) => (
            <tr key={row.key || rowIndex} className="hover:bg-accent-soft/30 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-line px-3 py-3 text-sm text-text">
                  {typeof column.render === "function" ? column.render(row, column.key) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="border-b border-line px-3 py-8 text-center text-sm text-muted"
              >
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


