import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { ApiResponseFactory } from "../@types/api/response.factory";
import { SchemaValidationError } from "../@types/errors/schema-validation-error";
import {
  addMemberSchema,
  createChannelSchema,
  historyQuerySchema,
  postMessageBodySchema,
} from "../realtime/realtime.schema";
import {
  addChannelMember,
  createChannel,
  listChannelMembers,
  listChannelMessages,
  sendChannelMessage,
} from "../realtime/realtime.service";

export const channelRoutes = Router();

channelRoutes.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createChannelSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Dados inválidos"
        );
      }
      const channel = await createChannel(req.user!.id, parsed.data);
      return res
        .status(201)
        .json(ApiResponseFactory.success(channel, "Canal criado", 201));
    } catch (err) {
      next(err);
    }
  }
);

channelRoutes.post(
  "/:id/members",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = addMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Dados inválidos"
        );
      }
      const member = await addChannelMember(
        req.user!.id,
        req.params.id as string,
        parsed.data
      );
      return res
        .status(201)
        .json(ApiResponseFactory.success(member, "Membro adicionado", 201));
    } catch (err) {
      next(err);
    }
  }
);

channelRoutes.get(
  "/:id/members",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await listChannelMembers(
        req.params.id as string,
        req.user!.id
      );
      return res
        .status(200)
        .json(ApiResponseFactory.success(result, "Membros listados"));
    } catch (err) {
      next(err);
    }
  }
);

channelRoutes.get(
  "/:id/messages",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = historyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Query inválida"
        );
      }
      const result = await listChannelMessages({
        channelId: req.params.id as string,
        userId: req.user!.id,
        cursor: parsed.data.cursor,
        limit: parsed.data.limit,
      });
      return res
        .status(200)
        .json(ApiResponseFactory.success(result, "Histórico carregado"));
    } catch (err) {
      next(err);
    }
  }
);

// POST /channels/:id/messages — fallback REST do frontend (sem emit socket).
// Mesma validação zod e idempotência clientMessageId do message:send.
channelRoutes.post(
  "/:id/messages",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = postMessageBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new SchemaValidationError(
          parsed.error.issues[0]?.message || "Dados inválidos"
        );
      }
      const { message, deduplicated } = await sendChannelMessage({
        channelId: req.params.id as string,
        authorId: req.user!.id,
        content: parsed.data.content,
        clientMessageId: parsed.data.clientMessageId,
      });
      const status = deduplicated ? 200 : 201;
      return res
        .status(status)
        .json(
          ApiResponseFactory.success(
            { message, deduplicated },
            deduplicated ? "Mensagem já enviada" : "Mensagem enviada",
            status
          )
        );
    } catch (err) {
      next(err);
    }
  }
);
