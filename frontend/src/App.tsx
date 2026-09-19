import { useState } from 'react';
import { DataPreview } from './components/DataPreview';
import { Header } from './components/Header';
import { NumericStats } from './components/NumericStats';
import { StatCard } from './components/StatCard';
import { UploadCard } from './components/UploadCard';
import { analyzeCsv } from './services/api';
import type { CsvAnalysis } from './types/csv';

function App() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setAnalysis(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a CSV file.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await analyzeCsv(file);
      setAnalysis(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to analyze this file.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const missingValues = analysis
    ? analysis.missing_values.reduce((total, value) => total + value, 0)
    : null;

  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <UploadCard
          file={selectedFile}
          isLoading={isLoading}
          error={error}
          onFileSelected={handleFileSelected}
        />

        <section className="dashboard" aria-label="Analysis dashboard preview">
          <div className="section-heading">
            <p className="eyebrow">ANALYSIS OVERVIEW</p>
            <h2>{analysis ? 'Analysis complete' : 'Ready for your data'}</h2>
          </div>

          <div className="metric-grid">
            <StatCard label="Rows" value={analysis ? String(analysis.rows) : '—'} detail="Total records" />
            <StatCard label="Columns" value={analysis ? String(analysis.columns) : '—'} detail="Detected fields" />
            <StatCard label="Missing Values" value={missingValues === null ? '—' : String(missingValues)} detail="Across all columns" />
          </div>
        </section>

        <div className="analysis-grid">
          <DataPreview analysis={analysis} />
          <NumericStats analysis={analysis} />
        </div>
      </main>
    </div>
  );
}

export default App;
