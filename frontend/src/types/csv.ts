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
  column_types: string[];
  missing_values: number[];
  numeric_stats: Array<NumericStats | null>;
  preview: string[][];
};
