import { Request, Response, NextFunction } from "express";
import { getProfileUseCase } from "./get-profile.use-case";
import { ApiResponseFactory } from "../../../@types/api/response.factory";

export async function getProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const user = await getProfileUseCase(id);

    return res.status(200).json(
      ApiResponseFactory.success(user)
    );
  } catch (err) {
    next(err);
  }
}
