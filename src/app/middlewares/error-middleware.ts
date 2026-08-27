import { Request, Response, NextFunction } from "express";
import { logger } from "../../shared/logger";
import { ApiError } from "../@types/api/api-error";
import { ApiResponseFactory } from "../@types/api/response.factory";
import { InternalError } from "../@types/errors/internal-error";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(ApiResponseFactory.error(err));
  }

  logger.error({ err }, "Erro interno não tratado");
  return res.status(500).json(ApiResponseFactory.error(new InternalError()));
}
