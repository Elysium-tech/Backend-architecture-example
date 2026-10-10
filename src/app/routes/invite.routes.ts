import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { ApiResponseFactory } from "../@types/api/response.factory";
import { acceptInvite, getInviteInfo } from "../realtime/realtime.service";

export const inviteRoutes = Router();

inviteRoutes.get(
  "/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const info = await getInviteInfo(req.params.token as string);
      return res
        .status(200)
        .json(ApiResponseFactory.success(info, "Convite encontrado"));
    } catch (err) {
      next(err);
    }
  }
);

inviteRoutes.post(
  "/:token/accept",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await acceptInvite(
        req.user!.id,
        req.params.token as string
      );
      return res
        .status(200)
        .json(ApiResponseFactory.success(result, "Convite aceito"));
    } catch (err) {
      next(err);
    }
  }
);
