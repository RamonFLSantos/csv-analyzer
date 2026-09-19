import type { CsvAnalysis } from '../types/csv';

type DataPreviewProps = {
  analysis: CsvAnalysis | null;
};

export function DataPreview({ analysis }: DataPreviewProps) {
  return (
    <section className="panel data-preview" aria-labelledby="preview-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SAMPLE</p>
          <h2 id="preview-title">Data Preview</h2>
        </div>
        <span className="panel-meta">{analysis ? `${analysis.preview.length} ROWS` : 'WAITING'}</span>
      </div>

      {analysis ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {analysis.column_names.map((column, index) => <th key={`${column}-${index}`}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {analysis.preview.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {analysis.column_names.map((column, columnIndex) => {
                    const cell = row[columnIndex] ?? '';

                    return (
                      <td className={cell === '' ? 'is-empty' : ''} key={`${column}-${rowIndex}`}>
                        {cell === '' ? '—' : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-panel-state">Upload a CSV to see the data preview.</p>
      )}
    </section>
  );
}
