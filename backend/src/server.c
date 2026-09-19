#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#include <sys/stat.h>

#include <microhttpd.h>
#include <cjson/cJSON.h>

#include "server.h"
#include "analyzer.h"

#define UPLOAD_DIR "uploads"
#define MAX_UPLOAD_SIZE (10 * 1024 * 1024)

typedef struct {
    FILE *file;
    char filename[256];
    size_t size;
    int error;

    struct MHD_PostProcessor *processor;

} UploadContext;


/*
 * ==========================================================
 * PROCESSAMENTO DO UPLOAD
 * ==========================================================
 */

static enum MHD_Result handle_upload(
    void *cls,
    enum MHD_ValueKind kind,
    const char *key,
    const char *filename,
    const char *content_type,
    const char *transfer_encoding,
    const char *data,
    uint64_t off,
    size_t size
) {
    (void)kind;
    (void)content_type;
    (void)transfer_encoding;
    (void)off;

    UploadContext *context = cls;

    if (context == NULL) {
        return MHD_NO;
    }

    /*
     * Estamos interessados apenas no campo "file".
     */
    if (strcmp(key, "file") != 0) {
        return MHD_YES;
    }

    /*
     * Primeira chamada: recebemos o nome do arquivo.
     */
    if (context->file == NULL) {

        if (filename == NULL) {
            context->error = 1;
            return MHD_NO;
        }

        strncpy(
            context->filename,
            filename,
            sizeof(context->filename) - 1
        );

        context->filename[
            sizeof(context->filename) - 1
        ] = '\0';

        context->file = fopen(
            "uploads/upload.csv",
            "wb"
        );

        if (context->file == NULL) {
            context->error = 1;
            return MHD_NO;
        }
    }

    /*
     * Recebe os dados do arquivo.
     */
    if (size > 0) {

        /*
         * Verifica o limite antes de escrever.
         */
        if (context->size + size > MAX_UPLOAD_SIZE) {
            context->error = 1;
            return MHD_NO;
        }

        size_t written = fwrite(
            data,
            1,
            size,
            context->file
        );

        if (written != size) {
            context->error = 1;
            return MHD_NO;
        }

        context->size += written;
    }

    return MHD_YES;
}


/*
 * ==========================================================
 * TRATAMENTO DAS REQUISIÇÕES HTTP
 * ==========================================================
 */

static enum MHD_Result handle_request(
    void *cls,
    struct MHD_Connection *connection,
    const char *url,
    const char *method,
    const char *version,
    const char *upload_data,
    size_t *upload_data_size,
    void **con_cls
) {
    (void)cls;
    (void)version;

    printf("%s %s\n", method, url);


    /*
     * ======================================================
     * POST /api/analyze
     * ======================================================
     */

    if (strcmp(method, "POST") == 0 &&
        strcmp(url, "/api/analyze") == 0) {

        UploadContext *context = *con_cls;

        /*
         * Primeira chamada da requisição.
         */
        if (context == NULL) {

            context = calloc(
                1,
                sizeof(UploadContext)
            );

            if (context == NULL) {
                return MHD_NO;
            }

            *con_cls = context;

            struct MHD_PostProcessor *processor =
                MHD_create_post_processor(
                    connection,
                    65536,
                    handle_upload,
                    context
                );

            if (processor == NULL) {
                free(context);
                *con_cls = NULL;
                return MHD_NO;
            }

            /*
             * Guardamos o processor no contexto.
             */
            context->processor = processor;

            return MHD_YES;
        }


        /*
         * Ainda estamos recebendo dados.
         */
        if (*upload_data_size > 0) {

            enum MHD_Result process_result =
                MHD_post_process(
                    context->processor,
                    upload_data,
                    *upload_data_size
                );

            *upload_data_size = 0;

            if (process_result == MHD_NO) {
                context->error = 1;
                return MHD_NO;
            }

            return MHD_YES;
        }


        /*
         * Upload terminou.
         */

        if (context->file != NULL) {
            fclose(context->file);
            context->file = NULL;
        }

        if (context->processor != NULL) {
            MHD_destroy_post_processor(
                context->processor
            );

            context->processor = NULL;
        }


        /*
         * Verifica se ocorreu algum erro durante o upload.
         */
        if (context->error) {

            free(context);
            *con_cls = NULL;

            const char *response_data =
                "{\"status\":\"error\",\"message\":\"Upload failed\"}";

            struct MHD_Response *response =
                MHD_create_response_from_buffer(
                    strlen(response_data),
                    (void *)response_data,
                    MHD_RESPMEM_PERSISTENT
                );

            if (response == NULL) {
                return MHD_NO;
            }

            MHD_add_response_header(
                response,
                "Content-Type",
                "application/json"
            );

            enum MHD_Result result =
                MHD_queue_response(
                    connection,
                    MHD_HTTP_BAD_REQUEST,
                    response
                );

            MHD_destroy_response(response);

            return result;
        }


        /*
         * Log do arquivo recebido.
         */
        printf(
            "Received: %s (%zu bytes)\n",
            context->filename,
            context->size
        );


        /*
         * ==================================================
         * ANÁLISE DO CSV
         * ==================================================
         */

        CsvAnalysis analysis;

        if (!analyze_csv(
                "uploads/upload.csv",
                &analysis
            )) {

            free(context);
            *con_cls = NULL;

            const char *response_data =
                "{\"status\":\"error\",\"message\":\"Could not analyze CSV\"}";

            struct MHD_Response *response =
                MHD_create_response_from_buffer(
                    strlen(response_data),
                    (void *)response_data,
                    MHD_RESPMEM_PERSISTENT
                );

            if (response == NULL) {
                return MHD_NO;
            }

            MHD_add_response_header(
                response,
                "Content-Type",
                "application/json"
            );

            enum MHD_Result result =
                MHD_queue_response(
                    connection,
                    MHD_HTTP_INTERNAL_SERVER_ERROR,
                    response
                );

            MHD_destroy_response(response);

            return result;
        }


        printf(
            "Analysis: %d rows, %d columns\n",
            analysis.rows,
            analysis.columns
        );


        /*
         * ==================================================
         * CRIAÇÃO DO JSON
         * ==================================================
         */

        cJSON *json = cJSON_CreateObject();

        if (json == NULL) {
            free(context);
            *con_cls = NULL;
            return MHD_NO;
        }

        cJSON_AddStringToObject(
            json,
            "status",
            "ok"
        );

        cJSON_AddStringToObject(
            json,
            "filename",
            context->filename
        );

        cJSON_AddNumberToObject(
            json,
            "rows",
            analysis.rows
        );

        cJSON_AddNumberToObject(
            json,
            "columns",
            analysis.columns
        );

        /*
        * Nomes das colunas.
        */
        cJSON *column_names =
            cJSON_CreateArray();

        if (column_names == NULL) {
            cJSON_Delete(json);
            free(context);
            *con_cls = NULL;
            return MHD_NO;
        }

        for (
            int i = 0;
            i < analysis.columns;
            i++
        ) {
            cJSON_AddItemToArray(
                column_names,
                cJSON_CreateString(
                    analysis.column_names[i]
                )
            );
        }

        cJSON_AddItemToObject(
            json,
            "column_names",
            column_names
        );

        /*
        * Tipos das colunas.
        */
        cJSON *column_types =
            cJSON_CreateArray();

        if (column_types == NULL) {
            cJSON_Delete(json);
            free(context);
            *con_cls = NULL;
            return MHD_NO;
        }

        for (
            int i = 0;
            i < analysis.columns;
            i++
        ) {
            cJSON_AddItemToArray(
                column_types,
                cJSON_CreateString(
                    column_type_to_string(
                        analysis.column_types[i]
                    )
                )
            );
        }

        cJSON_AddItemToObject(
            json,
            "column_types",
            column_types
        );

        /*
         * Converte o objeto cJSON para string.
         */
        char *json_string =
            cJSON_PrintUnformatted(json);

        cJSON_Delete(json);

        if (json_string == NULL) {
            free(context);
            *con_cls = NULL;
            return MHD_NO;
        }


        /*
         * Cria a resposta HTTP.
         */
        struct MHD_Response *response =
            MHD_create_response_from_buffer(
                strlen(json_string),
                (void *)json_string,
                MHD_RESPMEM_MUST_COPY
            );

        cJSON_free(json_string);

        if (response == NULL) {
            free(context);
            *con_cls = NULL;
            return MHD_NO;
        }


        /*
         * Define o tipo da resposta.
         */
        MHD_add_response_header(
            response,
            "Content-Type",
            "application/json"
        );


        /*
         * Envia a resposta.
         */
        enum MHD_Result result =
            MHD_queue_response(
                connection,
                MHD_HTTP_OK,
                response
            );


        /*
         * Libera os recursos.
         */
        MHD_destroy_response(response);

        free(context);
        *con_cls = NULL;

        return result;
    }


    /*
     * ======================================================
     * APENAS GET É ACEITO NAS OUTRAS ROTAS
     * ======================================================
     */

    if (strcmp(method, "GET") != 0) {

        const char *message =
            "Method Not Allowed";

        struct MHD_Response *response =
            MHD_create_response_from_buffer(
                strlen(message),
                (void *)message,
                MHD_RESPMEM_PERSISTENT
            );

        if (response == NULL) {
            return MHD_NO;
        }

        enum MHD_Result result =
            MHD_queue_response(
                connection,
                MHD_HTTP_METHOD_NOT_ALLOWED,
                response
            );

        MHD_destroy_response(response);

        return result;
    }


    /*
     * ======================================================
     * GET /api/health
     * ======================================================
     */

    if (strcmp(url, "/api/health") == 0) {

        cJSON *json =
            cJSON_CreateObject();

        if (json == NULL) {
            return MHD_NO;
        }

        cJSON_AddStringToObject(
            json,
            "status",
            "ok"
        );

        char *json_string =
            cJSON_PrintUnformatted(json);

        cJSON_Delete(json);

        if (json_string == NULL) {
            return MHD_NO;
        }

        struct MHD_Response *response =
            MHD_create_response_from_buffer(
                strlen(json_string),
                (void *)json_string,
                MHD_RESPMEM_MUST_COPY
            );

        cJSON_free(json_string);

        if (response == NULL) {
            return MHD_NO;
        }

        MHD_add_response_header(
            response,
            "Content-Type",
            "application/json"
        );

        enum MHD_Result result =
            MHD_queue_response(
                connection,
                MHD_HTTP_OK,
                response
            );

        MHD_destroy_response(response);

        return result;
    }


    /*
     * ======================================================
     * ROTA NÃO ENCONTRADA
     * ======================================================
     */

    const char *message =
        "Not Found";

    struct MHD_Response *response =
        MHD_create_response_from_buffer(
            strlen(message),
            (void *)message,
            MHD_RESPMEM_PERSISTENT
        );

    if (response == NULL) {
        return MHD_NO;
    }

    enum MHD_Result result =
        MHD_queue_response(
            connection,
            MHD_HTTP_NOT_FOUND,
            response
        );

    MHD_destroy_response(response);

    return result;
}


/*
 * ==========================================================
 * INICIALIZAÇÃO DO SERVIDOR
 * ==========================================================
 */

int start_server(void) {

    /*
     * Cria a pasta de uploads.
     */
    mkdir(UPLOAD_DIR);

    struct MHD_Daemon *daemon;

    daemon = MHD_start_daemon(
        MHD_USE_INTERNAL_POLLING_THREAD,
        SERVER_PORT,
        NULL,
        NULL,
        &handle_request,
        NULL,
        MHD_OPTION_END
    );

    if (daemon == NULL) {

        fprintf(
            stderr,
            "Failed to start server.\n"
        );

        return EXIT_FAILURE;
    }

    printf("\n");
    printf("=====================================\n");
    printf("       CSV Analyzer Backend\n");
    printf("=====================================\n");

    printf(
        "Server running on port %d\n",
        SERVER_PORT
    );

    printf(
        "Health: http://localhost:%d/api/health\n",
        SERVER_PORT
    );

    printf("=====================================\n");


    /*
     * Mantém o servidor rodando.
     */
    getchar();


    /*
     * Encerra o servidor.
     */
    MHD_stop_daemon(daemon);

    return EXIT_SUCCESS;
}