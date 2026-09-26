import { Request, Response, NextFunction } from "express";
import { updateProfileSchema } from "./update-profile.schema";
import { updateProfileUseCase } from "./update-profile.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";
import { SchemaValidationError } from "../../../@types/errors/schema-validation-error";

export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new SchemaValidationError(parsed.error.issues[0]?.message || "Dados inválidos");
    }

    const user = await updateProfileUseCase(req.user!.id, parsed.data);

    return res.status(200).json(
      ApiResponseFactory.success(user, "Perfil atualizado com sucesso")
    );
  } catch (err) {
    next(err);
  }
}
