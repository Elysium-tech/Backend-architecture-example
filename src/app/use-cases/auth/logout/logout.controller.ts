import { Request, Response, NextFunction } from "express";
import { logoutUseCase } from "./logout.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await logoutUseCase(req.user!.sessionId, req.user!.id);

    return res.status(200).json(
      ApiResponseFactory.success(null, "Logout realizado com sucesso")
    );
  } catch (err) {
    next(err);
  }
}
