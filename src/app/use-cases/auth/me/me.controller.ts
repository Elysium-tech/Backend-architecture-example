import { Request, Response, NextFunction } from "express";
import { meUseCase } from "./me.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await meUseCase(req.user!.id);

    return res.status(200).json(
      ApiResponseFactory.success(user)
    );
  } catch (err) {
    next(err);
  }
}
