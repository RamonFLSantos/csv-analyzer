#ifndef ANALYZER_H
#define ANALYZER_H

#define MAX_COLUMNS 100
#define MAX_COLUMN_NAME_LENGTH 128

typedef enum {
    COLUMN_TYPE_UNKNOWN,
    COLUMN_TYPE_INTEGER,
    COLUMN_TYPE_FLOAT,
    COLUMN_TYPE_BOOLEAN,
    COLUMN_TYPE_STRING
} ColumnType;

typedef struct {
    double minimum;
    double maximum;
    double average;
} NumericStats;

typedef struct {
    int rows;
    int columns;

    char column_names[MAX_COLUMNS][MAX_COLUMN_NAME_LENGTH];

    ColumnType column_types[MAX_COLUMNS];

    int missing_values[MAX_COLUMNS];

    NumericStats numeric_stats[MAX_COLUMNS];

} CsvAnalysis;

int analyze_csv(
    const char *file_path,
    CsvAnalysis *result
);

const char *column_type_to_string(
    ColumnType type
);

#endif
