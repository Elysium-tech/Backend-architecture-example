import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { ApiResponseFactory } from "../@types/api/response.factory";
import { SchemaValidationError } from "../@types/errors/schema-validation-error";
import { createGuildSchema, createInviteSchema } from "../realtime/realtime.schema";
import {
  createGuild,
  createInvite,
  listGuildsForUser,
} from "../realtime/realtime.service";

export const guildRoutes = Router();

guildRoutes.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guilds = await listGuildsForUser(req.user!.id);
      return res
        .status(200)
        .json(ApiResponseFactory.success(guilds, "Servidores carregados"));
    } catch (err) {
      next(err);
    }
  }
);

guildRoutes.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createGuildSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Dados inválidos"
        );
      }
      const result = await createGuild(req.user!.id, parsed.data);
      return res
        .status(201)
        .json(ApiResponseFactory.success(result, "Servidor criado", 201));
    } catch (err) {
      next(err);
    }
  }
);

guildRoutes.post(
  "/:id/invites",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Dados inválidos"
        );
      }
      const invite = await createInvite(
        req.user!.id,
        req.params.id as string,
        parsed.data
      );
      return res
        .status(201)
        .json(ApiResponseFactory.success(invite, "Convite criado", 201));
    } catch (err) {
      next(err);
    }
  }
);
