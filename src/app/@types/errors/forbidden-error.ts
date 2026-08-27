import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403, internalErrorCodes.FORBIDDEN_ERROR);
  }
}
