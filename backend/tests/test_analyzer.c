#include <stdio.h>
#include <string.h>

#include "analyzer.h"

static int failures = 0;

static void expect_int(
    const char *label,
    int actual,
    int expected
) {
    if (actual != expected) {
        printf(
            "  %s: expected %d, got %d\n",
            label,
            expected,
            actual
        );
        failures++;
    }
}

static void expect_string(
    const char *label,
    const char *actual,
    const char *expected
) {
    if (strcmp(actual, expected) != 0) {
        printf(
            "  %s: expected \"%s\", got \"%s\"\n",
            label,
            expected,
            actual
        );
        failures++;
    }
}

static void expect_double(
    const char *label,
    double actual,
    double expected
) {
    const double epsilon = 0.000001;

    if (
        actual - expected > epsilon ||
        expected - actual > epsilon
    ) {
        printf(
            "  %s: expected %.12f, got %.12f\n",
            label,
            expected,
            actual
        );
        failures++;
    }
}

static void report_test(
    const char *name,
    int failures_before
) {
    if (failures == failures_before) {
        printf("[PASS] %s\n", name);
    } else {
        printf("[FAIL] %s\n", name);
    }
}

static int analyze_fixture(
    const char *path,
    CsvAnalysis *analysis
) {
    if (!analyze_csv(path, analysis)) {
        printf("  could not analyze %s\n", path);
        failures++;
        return 0;
    }

    return 1;
}

static void test_basic_csv(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/basic.csv", &analysis)) {
        expect_int("rows", analysis.rows, 3);
        expect_int("columns", analysis.columns, 3);
        expect_string("column 0", analysis.column_names[0], "nome");
        expect_string("column 1", analysis.column_names[1], "idade");
        expect_string("column 2", analysis.column_names[2], "cidade");
    }

    report_test("basic csv", failures_before);
}

static void test_type_detection(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/types.csv", &analysis)) {
        expect_int("nome type", analysis.column_types[0], COLUMN_TYPE_STRING);
        expect_int("idade type", analysis.column_types[1], COLUMN_TYPE_INTEGER);
        expect_int("salario type", analysis.column_types[2], COLUMN_TYPE_FLOAT);
        expect_int("ativo type", analysis.column_types[3], COLUMN_TYPE_BOOLEAN);
    }

    report_test("type detection", failures_before);
}

static void test_missing_values(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/missing.csv", &analysis)) {
        expect_int("nome missing", analysis.missing_values[0], 0);
        expect_int("idade missing", analysis.missing_values[1], 1);
        expect_int("salario missing", analysis.missing_values[2], 1);
        expect_int("ativo missing", analysis.missing_values[3], 0);
        expect_int("idade type", analysis.column_types[1], COLUMN_TYPE_INTEGER);
        expect_int("salario type", analysis.column_types[2], COLUMN_TYPE_FLOAT);
    }

    report_test("missing values", failures_before);
}

static void test_numeric_statistics(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/stats.csv", &analysis)) {
        expect_double("idade minimum", analysis.numeric_stats[1].minimum, 21.0);
        expect_double("idade maximum", analysis.numeric_stats[1].maximum, 30.0);
        expect_double("idade average", analysis.numeric_stats[1].average, 25.5);
        expect_double("salario minimum", analysis.numeric_stats[2].minimum, 3500.50);
        expect_double("salario maximum", analysis.numeric_stats[2].maximum, 5100.75);
        expect_double(
            "salario average",
            analysis.numeric_stats[2].average,
            4267.083333333333
        );
    }

    report_test("numeric statistics", failures_before);
}

static void test_preview(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/missing.csv", &analysis)) {
        expect_int("preview rows", analysis.preview_rows, 3);
        expect_string("preview Ramon", analysis.preview[0].values[0], "Ramon");
        expect_string("preview Joao age", analysis.preview[1].values[1], "");
        expect_string("preview Maria salary", analysis.preview[2].values[2], "");
    }

    report_test("preview", failures_before);
}

static void test_preview_limit(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/preview_limit.csv", &analysis)) {
        expect_int("rows", analysis.rows, 6);
        expect_int("preview rows", analysis.preview_rows, MAX_PREVIEW_ROWS);
        expect_string("last preview row", analysis.preview[4].values[0], "E");
    }

    report_test("preview limit", failures_before);
}

static void test_empty_csv(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_csv("tests/data/empty.csv", &analysis)) {
        printf("  empty CSV was accepted\n");
        failures++;
    }

    report_test("empty csv", failures_before);
}

static void test_trailing_empty_fields(void) {
    int failures_before = failures;
    CsvAnalysis analysis;

    if (analyze_fixture("tests/data/trailing_empty.csv", &analysis)) {
        expect_int("cidade missing", analysis.missing_values[2], 2);
        expect_string("first trailing field", analysis.preview[0].values[2], "");
        expect_string("middle city", analysis.preview[1].values[2], "Porto Alegre");
        expect_string("last trailing field", analysis.preview[2].values[2], "");
    }

    report_test("trailing empty fields", failures_before);
}

int main(void) {
    test_basic_csv();
    test_type_detection();
    test_missing_values();
    test_numeric_statistics();
    test_preview();
    test_preview_limit();
    test_empty_csv();
    test_trailing_empty_fields();

    if (failures == 0) {
        printf("All tests passed.\n");
        return 0;
    }

    printf("%d test assertion(s) failed.\n", failures);
    return 1;
}
