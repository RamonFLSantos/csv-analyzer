export type ColumnType = 'integer' | 'float' | 'boolean' | 'string' | 'unknown';

export type NumericStats = {
  minimum: number;
  maximum: number;
  average: number;
};

export type CsvAnalysis = {
  status: 'ok';
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  column_types: ColumnType[];
  missing_values: number[];
  numeric_stats: Array<NumericStats | null>;
  preview: string[][];
};

export type ApiError = {
  status: 'error';
  message: string;
};
