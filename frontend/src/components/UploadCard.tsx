import { DragEvent, ChangeEvent, useRef, useState } from 'react';

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (file?: File) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
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
        <h1 id="upload-title">Upload your CSV</h1>
        <p>Drop a comma-separated file here to prepare an analysis.</p>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'drop-zone--active' : ''}`}
        onDragEnter={() => setIsDragging(true)}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="drop-zone__icon" aria-hidden="true">↑</span>
        <p>Drag &amp; drop your file here</p>
        <span>CSV files only</span>

        <input
          ref={inputRef}
          id="csv-file"
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
        />
        <label className="button button--primary" htmlFor="csv-file">
          Choose CSV
        </label>
      </div>

      <div className="file-status" aria-live="polite">
        {selectedFile ? (
          <>
            <span className="file-status__dot" aria-hidden="true" />
            <span className="file-status__name">{selectedFile.name}</span>
            <span>{formatFileSize(selectedFile.size)}</span>
          </>
        ) : (
          <span>No file selected</span>
        )}
      </div>
    </section>
  );
}
