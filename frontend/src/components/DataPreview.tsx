const rows = [
  ['Ramon', '21', '3500.50', 'true'],
  ['Joao', '—', '4200.00', 'false'],
  ['Maria', '30', '5100.75', 'true'],
];

const columns = ['nome', 'idade', 'salario', 'ativo'];

export function DataPreview() {
  return (
    <section className="panel data-preview" aria-labelledby="preview-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SAMPLE</p>
          <h2 id="preview-title">Data Preview</h2>
        </div>
        <span className="panel-meta">3 ROWS</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td className={cell === '—' ? 'is-empty' : ''} key={`${row[0]}-${columns[index]}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
