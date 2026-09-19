import type { CsvAnalysis } from '../types/csv';

type DataPreviewProps = {
  analysis: CsvAnalysis | null;
};

function TableIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
      />
      <path d="M4 10h16M10 5v14" />
    </svg>
  );
}

export function DataPreview({
  analysis,
}: DataPreviewProps) {
  return (
    <section
      className="panel data-preview"
      aria-labelledby="preview-title"
    >
      <div className="panel-heading">
        <div className="panel-heading__title">
          <span className="panel-icon">
            <TableIcon />
          </span>

          <h2 id="preview-title">
            Pré-visualização dos dados
          </h2>
        </div>

        <span className="panel-meta">
          {analysis
            ? `${analysis.preview.length} linhas`
            : 'Aguardando arquivo'}
        </span>
      </div>

      {analysis ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {analysis.column_names.map(
                  (column, index) => (
                    <th
                      key={`${column}-${index}`}
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {analysis.preview.map(
                (row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {analysis.column_names.map(
                      (column, columnIndex) => {
                        const cell =
                          row[columnIndex] ?? '';

                        return (
                          <td
                            className={
                              cell === ''
                                ? 'is-empty'
                                : ''
                            }
                            key={`${column}-${rowIndex}`}
                          >
                            {cell === ''
                              ? '—'
                              : cell}
                          </td>
                        );
                      },
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-panel-state">
          Envie um arquivo CSV para visualizar
          as primeiras linhas.
        </p>
      )}
    </section>
  );
}