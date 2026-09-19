import type { ApiError, CsvAnalysis } from '../types/csv';

export type AnalyzeCsvResponse = CsvAnalysis;

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return response.status === 'error' && typeof response.message === 'string';
}

function isCsvAnalysis(value: unknown): value is CsvAnalysis {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    response.status === 'ok' &&
    typeof response.filename === 'string' &&
    typeof response.rows === 'number' &&
    typeof response.columns === 'number' &&
    Array.isArray(response.column_names) &&
    Array.isArray(response.column_types) &&
    Array.isArray(response.missing_values) &&
    Array.isArray(response.numeric_stats) &&
    Array.isArray(response.preview)
  );
}

export async function analyzeCsv(file: File): Promise<CsvAnalysis> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiError(payload)) {
      throw new Error(payload.message);
    }

    throw new Error(`Analysis request failed (${response.status}).`);
  }

  if (!isCsvAnalysis(payload)) {
    throw new Error('The server returned an invalid analysis response.');
  }

  return payload;
}
