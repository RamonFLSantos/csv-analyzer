import { useEffect, useState } from 'react';
import { DataPreview } from './components/DataPreview';
import { Header } from './components/Header';
import { NumericStats } from './components/NumericStats';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import type { Theme as ThemeType } from './components/ThemeToggle';
import { UploadCard } from './components/UploadCard';
import { analyzeCsv } from './services/api';
import type { CsvAnalysis } from './types/csv';

function getInitialTheme(): ThemeType {
  const storedTheme = localStorage.getItem('csv-analyzer-theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function App() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('csv-analyzer-theme', theme);
  }, [theme]);

  const handleFileSelected = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(null);
      setAnalysis(null);
      setError('Selecione um arquivo CSV.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnalysis(null);
    setIsLoading(true);

    try {
      const result = await analyzeCsv(file);
      setAnalysis(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível analisar o arquivo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const missingValues = analysis
    ? analysis.missing_values.reduce((total, value) => total + value, 0)
    : null;

  return (
    <div className="app-shell" id="top">
      <Sidebar />

      <div className="app-main">
        <Header theme={theme} onThemeChange={setTheme} />

        <main className="main-content">
          <section className="hero" aria-labelledby="page-title">
            <p className="eyebrow">BEM-VINDO</p>

            <h1 id="page-title">
              Analise seus dados em CSV
            </h1>

            <p>
              Envie um arquivo e veja um resumo dos dados, uma amostra
              das linhas e estatísticas numéricas.
            </p>
          </section>

          <UploadCard
            file={selectedFile}
            isLoading={isLoading}
            error={error}
            onFileSelected={handleFileSelected}
          />

          <section
            className="dashboard"
            aria-label="Resumo da análise"
          >
            <div className="section-heading">
              <div>
                <h2>Panorama da análise</h2>

                <p>
                  {analysis
                    ? 'Análise concluída com os dados enviados.'
                    : 'Envie um arquivo para começar.'}
                </p>
              </div>
            </div>

            <div className="metric-grid">
              <StatCard
                label="Linhas"
                value={analysis ? String(analysis.rows) : '—'}
                detail="Total de registros"
                tone="green"
              />

              <StatCard
                label="Colunas"
                value={analysis ? String(analysis.columns) : '—'}
                detail="Campos detectados"
                tone="blue"
              />

              <StatCard
                label="Valores ausentes"
                value={
                  missingValues === null
                    ? '—'
                    : String(missingValues)
                }
                detail="Em todas as colunas"
                tone="amber"
              />
            </div>
          </section>

          <div className="analysis-grid">
            <DataPreview analysis={analysis} />
            <NumericStats analysis={analysis} />
          </div>
        </main>

        <footer className="app-footer">
          <span>
            CSV Analyzer · análise de dados em CSV
          </span>

          <span>
            Desenvolvido para portfólio
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;