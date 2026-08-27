import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, internalErrorCodes.NOT_FOUND_ERROR);
  }
}
