import { Request, Response, NextFunction } from "express";
import { registerSchema } from "./register.schema";
import { registerUseCase } from "./register.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";
import { SchemaValidationError } from "../../../@types/errors/schema-validation-error";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new SchemaValidationError(parsed.error.issues[0]?.message || "Dados inválidos");
    }

    const result = await registerUseCase(
      parsed.data,
      req.headers["user-agent"],
      req.ip
    );

    return res.status(201).json(
      ApiResponseFactory.success(result, "Conta criada com sucesso", 201)
    );
  } catch (err) {
    next(err);
  }
}
