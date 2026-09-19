const statistics = [
  { column: 'idade', minimum: '21', maximum: '30', average: '25.5' },
  { column: 'salario', minimum: '3500.50', maximum: '5100.75', average: '4267.08' },
];

export function NumericStats() {
  return (
    <section className="panel numeric-stats" aria-labelledby="statistics-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AGGREGATES</p>
          <h2 id="statistics-title">Numeric Statistics</h2>
        </div>
        <span className="panel-meta">2 COLUMNS</span>
      </div>

      <div className="stat-list">
        {statistics.map((stat) => (
          <article className="stat-row" key={stat.column}>
            <h3>{stat.column}</h3>
            <dl>
              <div><dt>Min</dt><dd>{stat.minimum}</dd></div>
              <div><dt>Max</dt><dd>{stat.maximum}</dd></div>
              <div><dt>Avg</dt><dd>{stat.average}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
