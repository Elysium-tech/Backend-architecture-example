import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class SchemaValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, internalErrorCodes.SCHEMA_VALIDATION_ERROR);
  }
}
