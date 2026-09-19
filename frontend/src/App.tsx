import { DataPreview } from './components/DataPreview';
import { Header } from './components/Header';
import { NumericStats } from './components/NumericStats';
import { StatCard } from './components/StatCard';
import { UploadCard } from './components/UploadCard';

function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <UploadCard />

        <section className="dashboard" aria-label="Analysis dashboard preview">
          <div className="section-heading">
            <p className="eyebrow">ANALYSIS OVERVIEW</p>
            <h2>Ready for your data</h2>
          </div>

          <div className="metric-grid">
            <StatCard label="Rows" value="—" detail="Total records" />
            <StatCard label="Columns" value="—" detail="Detected fields" />
            <StatCard label="Missing Values" value="—" detail="Across all columns" />
          </div>
        </section>

        <div className="analysis-grid">
          <DataPreview />
          <NumericStats />
        </div>
      </main>
    </div>
  );
}

export default App;
