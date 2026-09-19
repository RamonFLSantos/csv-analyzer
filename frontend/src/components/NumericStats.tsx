import type { CsvAnalysis } from '../types/csv';

type NumericStatsProps = {
  analysis: CsvAnalysis | null;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 19V9M12 19V5M19 19v-7" />
      <path d="M3.5 19.5h17" />
    </svg>
  );
}

export function NumericStats({
  analysis,
}: NumericStatsProps) {
  const statistics =
    analysis?.column_types.flatMap(
      (columnType, index) => {
        const stat =
          analysis.numeric_stats[index];

        if (
          (columnType !== 'integer' &&
            columnType !== 'float') ||
          stat === null
        ) {
          return [];
        }

        return [
          {
            column:
              analysis.column_names[index],
            ...stat,
          },
        ];
      },
    ) ?? [];

  return (
    <section
      className="panel numeric-stats"
      aria-labelledby="statistics-title"
    >
      <div className="panel-heading">
        <div className="panel-heading__title">
          <span className="panel-icon">
            <ChartIcon />
          </span>

          <h2 id="statistics-title">
            Estatísticas numéricas
          </h2>
        </div>

        <span className="panel-meta">
          {analysis
            ? `${statistics.length} colunas`
            : 'Aguardando arquivo'}
        </span>
      </div>

      {analysis ? (
        statistics.length > 0 ? (
          <div className="stat-list">
            {statistics.map((stat) => (
              <article
                className="stat-row"
                key={stat.column}
              >
                <h3>{stat.column}</h3>

                <dl>
                  <div>
                    <dt>Mínimo</dt>
                    <dd>
                      {formatNumber(
                        stat.minimum,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Máximo</dt>
                    <dd>
                      {formatNumber(
                        stat.maximum,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Média</dt>
                    <dd>
                      {formatNumber(
                        stat.average,
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-panel-state">
            Não foram encontrados campos numéricos.
          </p>
        )
      ) : (
        <p className="empty-panel-state">
          Envie um arquivo CSV para ver as
          estatísticas numéricas.
        </p>
      )}
    </section>
  );
}