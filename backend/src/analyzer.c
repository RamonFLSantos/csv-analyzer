#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>

#include "analyzer.h"

#define MAX_LINE_SIZE 4096


/*
 * ==========================================================
 * FUNÇÕES AUXILIARES
 * ==========================================================
 */

/*
 * Remove espaços no início e no final da string.
 */
static char *trim_whitespace(char *text) {

    while (isspace((unsigned char)*text)) {
        text++;
    }

    if (*text == '\0') {
        return text;
    }

    char *end = text + strlen(text) - 1;

    while (
        end > text &&
        isspace((unsigned char)*end)
    ) {
        end--;
    }

    *(end + 1) = '\0';

    return text;
}


/*
 * Verifica se um valor é booleano.
 */
static int is_boolean(const char *value) {

    if (
        strcmp(value, "true") == 0 ||
        strcmp(value, "false") == 0 ||
        strcmp(value, "TRUE") == 0 ||
        strcmp(value, "FALSE") == 0
    ) {
        return 1;
    }

    return 0;
}


/*
 * Verifica se um valor é inteiro.
 */
static int is_integer(const char *value) {

    if (value == NULL || *value == '\0') {
        return 0;
    }

    char *end;

    errno = 0;

    strtol(
        value,
        &end,
        10
    );

    if (errno == ERANGE) {
        return 0;
    }

    return (
        end != value &&
        *end == '\0'
    );
}


/*
 * Verifica se um valor é número decimal.
 */
static int is_float(const char *value) {

    if (value == NULL || *value == '\0') {
        return 0;
    }

    char *end;

    errno = 0;

    strtod(
        value,
        &end
    );

    if (errno == ERANGE) {
        return 0;
    }

    return (
        end != value &&
        *end == '\0'
    );
}


/*
 * Detecta o tipo de um único valor.
 */
static ColumnType detect_value_type(
    const char *value
) {

    if (value == NULL || *value == '\0') {
        return COLUMN_TYPE_UNKNOWN;
    }

    if (is_boolean(value)) {
        return COLUMN_TYPE_BOOLEAN;
    }

    if (is_integer(value)) {
        return COLUMN_TYPE_INTEGER;
    }

    if (is_float(value)) {
        return COLUMN_TYPE_FLOAT;
    }

    return COLUMN_TYPE_STRING;
}


/*
 * Combina o tipo atual da coluna com o tipo
 * encontrado em um novo valor.
 *
 * Exemplo:
 *
 * INTEGER + INTEGER → INTEGER
 * INTEGER + FLOAT   → FLOAT
 * INTEGER + STRING  → STRING
 */
static ColumnType merge_column_types(
    ColumnType current,
    ColumnType new_type
) {

    /*
     * Valor vazio não altera o tipo.
     */
    if (new_type == COLUMN_TYPE_UNKNOWN) {
        return current;
    }

    /*
     * Primeiro valor válido da coluna.
     */
    if (current == COLUMN_TYPE_UNKNOWN) {
        return new_type;
    }

    /*
     * Se já sabemos que é string,
     * não precisamos analisar novamente.
     */
    if (current == COLUMN_TYPE_STRING) {
        return COLUMN_TYPE_STRING;
    }

    /*
     * INTEGER + FLOAT = FLOAT.
     */
    if (
        (current == COLUMN_TYPE_INTEGER &&
         new_type == COLUMN_TYPE_FLOAT) ||

        (current == COLUMN_TYPE_FLOAT &&
         new_type == COLUMN_TYPE_INTEGER)
    ) {
        return COLUMN_TYPE_FLOAT;
    }

    /*
     * Mesmo tipo continua igual.
     */
    if (current == new_type) {
        return current;
    }

    /*
     * Qualquer combinação incompatível
     * resulta em STRING.
     */
    return COLUMN_TYPE_STRING;
}


/*
 * Converte o enum para o texto que será
 * enviado no JSON.
 */
const char *column_type_to_string(
    ColumnType type
) {

    switch (type) {

        case COLUMN_TYPE_INTEGER:
            return "integer";

        case COLUMN_TYPE_FLOAT:
            return "float";

        case COLUMN_TYPE_BOOLEAN:
            return "boolean";

        case COLUMN_TYPE_STRING:
            return "string";

        case COLUMN_TYPE_UNKNOWN:
        default:
            return "unknown";
    }
}


/*
 * ==========================================================
 * ANÁLISE DO CSV
 * ==========================================================
 */

int analyze_csv(
    const char *file_path,
    CsvAnalysis *result
) {

    if (result == NULL) {
        return 0;
    }

    FILE *file = fopen(
        file_path,
        "r"
    );

    if (file == NULL) {
        return 0;
    }


    /*
     * Inicializa o resultado.
     */
    result->rows = 0;
    result->columns = 0;

    for (
        int i = 0;
        i < MAX_COLUMNS;
        i++
    ) {
        result->column_names[i][0] = '\0';

        result->column_types[i] =
            COLUMN_TYPE_UNKNOWN;

        result->missing_values[i] = 0;
    }


    char line[MAX_LINE_SIZE];


    /*
     * ======================================================
     * LEITURA DO CABEÇALHO
     * ======================================================
     */

    if (
        fgets(
            line,
            sizeof(line),
            file
        ) == NULL
    ) {

        fclose(file);
        return 0;
    }


    /*
     * Remove \r e \n.
     */
    line[
        strcspn(
            line,
            "\r\n"
        )
    ] = '\0';


    /*
     * ======================================================
     * LEITURA DOS NOMES DAS COLUNAS
     * ======================================================
     */

    char *token = strtok(
        line,
        ","
    );

    while (
        token != NULL &&
        result->columns < MAX_COLUMNS
    ) {

        token = trim_whitespace(token);

        strncpy(
            result->column_names[
                result->columns
            ],
            token,
            MAX_COLUMN_NAME_LENGTH - 1
        );

        result->column_names[
            result->columns
        ][MAX_COLUMN_NAME_LENGTH - 1] = '\0';


        result->columns++;

        token = strtok(
            NULL,
            ","
        );
    }


    /*
     * ======================================================
     * LEITURA DOS DADOS
     * ======================================================
     */

    while (
        fgets(
            line,
            sizeof(line),
            file
        ) != NULL
    ) {

        result->rows++;


        /*
         * Remove quebra de linha.
         */
        line[
            strcspn(
                line,
                "\r\n"
            )
        ] = '\0';


        /*
         * Começa novamente pela primeira coluna.
         */
        token = strtok(
            line,
            ","
        );


        int column_index = 0;


        while (
            token != NULL &&
            column_index < result->columns
        ) {

            token = trim_whitespace(token);

            /*
            * Verifica se o valor está vazio.
            */
            if (*token == '\0') {

                result->missing_values[
                    column_index
                ]++;

                column_index++;

                token = strtok(
                    NULL,
                    ","
                );

                continue;
            }

            /*
            * Detecta o tipo do valor.
            */
            ColumnType value_type =
                detect_value_type(token);


            /*
             * Combina com os valores
             * encontrados anteriormente.
             */
            result->column_types[
                column_index
            ] = merge_column_types(
                result->column_types[
                    column_index
                ],
                value_type
            );


            column_index++;

            token = strtok(
                NULL,
                ","
            );
        }
    }


    fclose(file);

    return 1;
}