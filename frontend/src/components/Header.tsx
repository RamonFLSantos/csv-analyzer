export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="CSV Analyzer home">
        <span className="brand-mark" aria-hidden="true">///</span>
        <span>
          <strong>CSV Analyzer</strong>
          <small>Analyze your CSV data</small>
        </span>
      </a>
      <span className="header-status">LOCAL WORKSPACE</span>
    </header>
  );
}
