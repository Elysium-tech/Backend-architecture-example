import { Request, Response, NextFunction } from "express";
import { loginSchema } from "./login.schema";
import { loginUseCase } from "./login.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";
import { SchemaValidationError } from "../../../@types/errors/schema-validation-error";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new SchemaValidationError(parsed.error.issues[0]?.message || "Credenciais inválidas");
    }

    const result = await loginUseCase(
      parsed.data,
      req.headers["user-agent"],
      req.ip
    );

    return res.status(200).json(
      ApiResponseFactory.success(result, "Login realizado com sucesso")
    );
  } catch (err) {
    next(err);
  }
}
