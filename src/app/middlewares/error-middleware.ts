import { Request, Response, NextFunction } from "express";
import { AppError } from "../@types/errors/app-error";
import { logger } from "../../shared/logger";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error({ err }, "Erro interno não tratado");
  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
  });
}
