#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <sys/stat.h>

#include <microhttpd.h>
#include <cjson/cJSON.h>

#include "server.h"
#include "analyzer.h"

#define UPLOAD_DIR "uploads"
#define MAX_UPLOAD_SIZE (10 * 1024 * 1024)

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
    (void)upload_data;
    (void)upload_data_size;
    (void)con_cls;

    printf("%s %s\n", method, url);

    /*
     * Apenas GET é aceito neste momento.
     */
    if (strcmp(method, "GET") != 0) {

        const char *message = "Method Not Allowed";

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
     * Health check.
     */
    if (strcmp(url, "/api/health") == 0) {

        cJSON *json = cJSON_CreateObject();

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
     * Rota não encontrada.
     */
    const char *message = "Not Found";

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


int start_server(void) {

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

    getchar();

    MHD_stop_daemon(daemon);

    return EXIT_SUCCESS;
}