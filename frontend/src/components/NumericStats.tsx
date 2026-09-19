import type { CsvAnalysis } from '../types/csv';

type NumericStatsProps = {
  analysis: CsvAnalysis | null;
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 12,
}).format(value);

export function NumericStats({ analysis }: NumericStatsProps) {
  const statistics = analysis?.column_types.flatMap((columnType, index) => {
    const stat = analysis.numeric_stats[index];

    if ((columnType !== 'integer' && columnType !== 'float') || stat === null) {
      return [];
    }

    return [{ column: analysis.column_names[index], ...stat }];
  }) ?? [];

  return (
    <section className="panel numeric-stats" aria-labelledby="statistics-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AGGREGATES</p>
          <h2 id="statistics-title">Numeric Statistics</h2>
        </div>
        <span className="panel-meta">{analysis ? `${statistics.length} COLUMNS` : 'WAITING'}</span>
      </div>

      {analysis ? (
        <div className="stat-list">
          {statistics.map((stat) => (
          <article className="stat-row" key={stat.column}>
            <h3>{stat.column}</h3>
            <dl>
              <div><dt>Minimum</dt><dd>{formatNumber(stat.minimum)}</dd></div>
              <div><dt>Maximum</dt><dd>{formatNumber(stat.maximum)}</dd></div>
              <div><dt>Average</dt><dd>{formatNumber(stat.average)}</dd></div>
            </dl>
          </article>
          ))}
        </div>
      ) : (
        <p className="empty-panel-state">Upload a CSV to see numeric statistics.</p>
      )}
    </section>
  );
}
