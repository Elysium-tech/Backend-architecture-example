import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, internalErrorCodes.VALIDATION_ERROR);
  }
}
