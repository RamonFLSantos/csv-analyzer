import type {
  ChangeEvent,
  DragEvent,
} from 'react';
import { useState } from 'react';

type UploadCardProps = {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 13h6M9 16h4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 16V5" />
      <path d="m8 9 4-4 4 4" />
      <path d="M5 18.5h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m7 12.5 3.2 3.2L17.5 8.5" />
    </svg>
  );
}

export function UploadCard({
  file,
  isLoading,
  error,
  onFileSelected,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (selectedFile?: File) => {
    if (!isLoading && selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setIsDragging(false);

    selectFile(event.dataTransfer.files[0]);
  };

  return (
    <section
      className="upload-card"
      aria-labelledby="upload-title"
    >
      <div className="upload-card__intro">
        <span className="upload-card__icon">
          <FileIcon />
        </span>

        <div>
          <p className="eyebrow">
            ARQUIVO DE ENTRADA
          </p>

          <h1 id="upload-title">
            Enviar arquivo CSV
          </h1>

          <p>
            Escolha ou arraste seu arquivo para começar
            a análise.
          </p>
        </div>
      </div>

      <div
        className="upload-card__features"
        aria-label="Recursos da análise"
      >
        <div>
          <span className="feature-icon feature-icon--blue">
            <span>01</span>
          </span>

          <p>
            <strong>Análise automática</strong>
            <span>
              Tipos, estatísticas e valores ausentes
            </span>
          </p>
        </div>

        <div>
          <span className="feature-icon feature-icon--blue">
            <span>02</span>
          </span>

          <p>
            <strong>Pré-visualização</strong>
            <span>
              Veja uma amostra das primeiras linhas
            </span>
          </p>
        </div>

        <div>
          <span className="feature-icon feature-icon--green">
            <span>03</span>
          </span>

          <p>
            <strong>Processamento local</strong>
            <span>
              Os dados ficam no seu ambiente
            </span>
          </p>
        </div>
      </div>

      <div
        className={`drop-zone ${
          isDragging ? 'drop-zone--active' : ''
        } ${
          isLoading ? 'drop-zone--loading' : ''
        }`}
        onDragEnter={() =>
          !isLoading && setIsDragging(true)
        }
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDragLeave={() =>
          setIsDragging(false)
        }
        onDrop={handleDrop}
      >
        <span className="drop-zone__icon">
          <UploadIcon />
        </span>

        <p>
          {isLoading
            ? 'Analisando arquivo...'
            : 'Arraste seu arquivo CSV aqui'}
        </p>

        <span>
          {isLoading
            ? 'Aguarde um momento'
            : 'Apenas arquivos CSV'}
        </span>

        <input
          id="csv-file"
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
          disabled={isLoading}
        />

        <label
          className={`button button--primary ${
            isLoading ? 'button--disabled' : ''
          }`}
          htmlFor="csv-file"
          aria-disabled={isLoading}
        >
          {isLoading
            ? 'Analisando...'
            : 'Escolher arquivo'}
        </label>

        {!isLoading && (
          <small>
            ou clique para selecionar
          </small>
        )}
      </div>

      <div
        className={`file-status ${
          file ? 'has-file' : ''
        }`}
        aria-live="polite"
      >
        {file ? (
          <>
            <span className="file-status__check">
              <CheckIcon />
            </span>

            <span className="file-status__name">
              {file.name}
            </span>

            <span>
              {formatFileSize(file.size)}
            </span>
          </>
        ) : (
          <span>
            Nenhum arquivo selecionado
          </span>
        )}
      </div>

      {error && (
        <p
          className="upload-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}