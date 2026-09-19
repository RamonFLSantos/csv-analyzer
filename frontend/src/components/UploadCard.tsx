import type { ChangeEvent, DragEvent } from 'react';
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

export function UploadCard({ file, isLoading, error, onFileSelected }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (selectedFile?: File) => {
    if (!isLoading && selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  return (
    <section className="upload-card" aria-labelledby="upload-title">
      <div className="upload-card__copy">
        <p className="eyebrow">INPUT FILE</p>
        <h1 id="upload-title">{isLoading ? 'Analyzing...' : 'Upload your CSV'}</h1>
        <p>{isLoading ? 'The analyzer is processing your data.' : 'Drop a comma-separated file here to prepare an analysis.'}</p>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'drop-zone--active' : ''} ${isLoading ? 'drop-zone--loading' : ''}`}
        onDragEnter={() => !isLoading && setIsDragging(true)}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="drop-zone__icon" aria-hidden="true">{isLoading ? '…' : '↑'}</span>
        <p>{isLoading ? 'Analyzing CSV…' : 'Drag & drop your file here'}</p>
        <span>{isLoading ? 'Please wait' : 'CSV files only'}</span>

        <input
          id="csv-file"
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
          disabled={isLoading}
        />
        <label className={`button button--primary ${isLoading ? 'button--disabled' : ''}`} htmlFor="csv-file" aria-disabled={isLoading}>
          {isLoading ? 'Analyzing…' : 'Choose CSV'}
        </label>
      </div>

      <div className="file-status" aria-live="polite">
        {file ? (
          <>
            <span className="file-status__dot" aria-hidden="true" />
            <span className="file-status__name">{file.name}</span>
            <span>{formatFileSize(file.size)}</span>
          </>
        ) : (
          <span>No file selected</span>
        )}
      </div>
      {error && <p className="upload-error" role="alert">{error}</p>}
    </section>
  );
}
