import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, internalErrorCodes.CONFLICT_ERROR);
  }
}
