#include <stdio.h>

#include "analyzer.h"

int analyze_csv(const char *file_path) {

    FILE *file = fopen(file_path, "r");

    if (file == NULL) {
        fprintf(stderr, "Could not open CSV file.\n");
        return 0;
    }

    printf("Analyzing file: %s\n", file_path);

    fclose(file);

    return 1;
}