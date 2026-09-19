type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'blue' | 'green' | 'amber';
};

function StatIcon({
  tone,
}: {
  tone: NonNullable<StatCardProps['tone']>;
}) {
  if (tone === 'green') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (tone === 'amber') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m12 4 9 16H3L12 4Z" />
        <path d="M12 9v5M12 17.5v.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
      />
      <path d="M9 4v16M15 4v16" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = 'blue',
}: StatCardProps) {
  return (
    <article
      className={`metric-card metric-card--${tone}`}
    >
      <span className="metric-card__icon">
        <StatIcon tone={tone} />
      </span>

      <div className="metric-card__content">
        <span className="metric-card__label">
          {label}
        </span>

        <strong>{value}</strong>

        <small>{detail}</small>
      </div>
    </article>
  );
}