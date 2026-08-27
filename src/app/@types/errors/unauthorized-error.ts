import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class UnauthorizedError extends ApiError {
  constructor(message = "Token inválido ou ausente") {
    super(message, 401, internalErrorCodes.UNAUTHORIZED_ERROR);
  }
}
