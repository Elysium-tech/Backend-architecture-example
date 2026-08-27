import { ApiError } from "../api/api-error";
import { internalErrorCodes } from "./internal-error-codes";

export class AuthenticationError extends ApiError {
  constructor(message = "Credenciais inválidas!") {
    super(message, 401, internalErrorCodes.AUTHENTICATION_ERROR);
  }
}
