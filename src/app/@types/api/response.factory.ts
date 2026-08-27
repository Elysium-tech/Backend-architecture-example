import { ApiError, ApiErrorPayload } from "./api-error";
import { ApiResponseError, ApiResponseSuccess } from "./api-response";

export class ApiResponseFactory {
  static success<T>(
    body: T,
    message = "success",
    status = 200
  ): ApiResponseSuccess<T> {
    return {
      success: true,
      status,
      message,
      body,
    };
  }

  static error(error: ApiError): ApiResponseError<ApiErrorPayload> {
    return {
      success: false,
      status: error.statusCode,
      message: error.message,
      error: {
        code: error.internalCode,
        details: error.details,
      },
    };
  }
}
