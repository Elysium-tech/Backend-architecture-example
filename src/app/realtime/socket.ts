import { createServer, type Server as HttpServer } from "node:http";
import type { Express } from "express";
import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config";
import { prisma } from "../database/prisma";
import { logger } from "../../shared/logger";
import { UnauthorizedError } from "../@types/errors/unauthorized-error";
import { sendMessageSchema, joinChannelSchema } from "./realtime.schema";
import {
  assertChannelMembership,
  sendChannelMessage,
  toMessageDTO,
} from "./realtime.service";

interface JwtPayload {
  sub: string;
  sessionId: string;
}

export interface VerifiedSocketAuth {
  userId: string;
  sessionId: string;
}

export function roomForChannel(channelId: string): string {
  return `channel:${channelId}`;
}

function extractBearerToken(raw?: string | null): string {
  if (!raw) throw new UnauthorizedError("Token não informado");
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
  if (!token) throw new UnauthorizedError("Token não informado");
  return token;
}

/** Mesma regra do auth-middleware REST: JWT válido + sessão existente/não expirada + binding token/sub. */
export async function verifySocketToken(
  rawToken?: string | null
): Promise<VerifiedSocketAuth> {
  const token = extractBearerToken(rawToken);
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado");
  }

  const session = await prisma.session.findUnique({
    where: { id: decoded.sessionId },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    throw new UnauthorizedError("Sessão expirada ou inválida");
  }
  if (session.token !== token) {
    throw new UnauthorizedError("Sessão expirada ou inválida");
  }
  if (session.userId !== decoded.sub) {
    throw new UnauthorizedError("Sessão expirada ou inválida");
  }
  return { userId: decoded.sub, sessionId: decoded.sessionId };
}

type Ack = (res: unknown) => void;

export function registerSocketHandlers(io: Server, socket: Socket): void {
  const authUser = socket.data.user as { id: string } | undefined;
  const userId = authUser?.id;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.on("channel:join", async (payload: unknown, ack?: Ack) => {
    try {
      const parsed = joinChannelSchema.safeParse(payload);
      if (!parsed.success) {
        return ack?.({
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Payload inválido",
        });
      }
      await assertChannelMembership(parsed.data.channelId, userId);
      await socket.join(roomForChannel(parsed.data.channelId));
      return ack?.({ ok: true, channelId: parsed.data.channelId });
    } catch (err: any) {
      return ack?.({
        ok: false,
        error: err?.message ?? "Falha ao entrar no canal",
      });
    }
  });

  socket.on("channel:leave", async (payload: unknown, ack?: Ack) => {
    try {
      const parsed = joinChannelSchema.safeParse(payload);
      if (!parsed.success) {
        return ack?.({
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Payload inválido",
        });
      }
      await socket.leave(roomForChannel(parsed.data.channelId));
      return ack?.({ ok: true, channelId: parsed.data.channelId });
    } catch (err: any) {
      return ack?.({
        ok: false,
        error: err?.message ?? "Falha ao sair do canal",
      });
    }
  });

  socket.on("message:send", async (payload: unknown, ack?: Ack) => {
    // clientMessageId em TODOS os acks: o frontend casa a confirmação
    // com a mensagem pendente (otimista) por esse id.
    const requestedClientId =
      typeof (payload as { clientMessageId?: unknown } | null)?.clientMessageId ===
      "string"
        ? (payload as { clientMessageId: string }).clientMessageId
        : null;
    try {
      const parsed = sendMessageSchema.safeParse(payload);
      if (!parsed.success) {
        return ack?.({
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Mensagem inválida",
          clientMessageId: requestedClientId,
        });
      }
      const { message, deduplicated } = await sendChannelMessage({
        channelId: parsed.data.channelId,
        authorId: userId,
        content: parsed.data.content,
        clientMessageId: parsed.data.clientMessageId,
      });
      if (!deduplicated) {
        io.to(roomForChannel(parsed.data.channelId)).emit("message:new", message);
      }
      return ack?.({
        ok: true,
        message,
        deduplicated,
        clientMessageId: message.clientMessageId,
      });
    } catch (err: any) {
      return ack?.({
        ok: false,
        error: err?.message ?? "Falha ao enviar mensagem",
        clientMessageId: requestedClientId,
      });
    }
  });

  // Relay de "digitando": sem persistência, só repassa aos outros membros
  // da room. Exige membership para não vazar presença a estranhos.
  socket.on("typing", async (payload: unknown, ack?: Ack) => {
    try {
      const parsed = joinChannelSchema.safeParse(payload);
      if (!parsed.success) {
        return ack?.({
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Payload inválido",
        });
      }
      await assertChannelMembership(parsed.data.channelId, userId);
      socket
        .to(roomForChannel(parsed.data.channelId))
        .emit("typing", { channelId: parsed.data.channelId, user: userId });
      return ack?.({ ok: true });
    } catch (err: any) {
      return ack?.({
        ok: false,
        error: err?.message ?? "Falha ao enviar typing",
      });
    }
  });
}

async function setupRedisAdapter(io: Server): Promise<void> {
  if (!env.REDIS_URL) {
    logger.info("REDIS_URL ausente: Socket.IO em modo single-instance");
    return;
  }
  const pubClient = createClient({ url: env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Socket.IO com Redis adapter (multi-instância)");
}

export function createRealtimeServer(app: Express): {
  httpServer: HttpServer;
  io: Server;
} {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
    transports: ["websocket"],
  });

  io.use(async (socket, next) => {
    try {
      const raw =
        (socket.handshake.auth?.token as string | undefined) ??
        socket.handshake.headers.authorization;
      const verified = await verifySocketToken(raw ?? null);
      socket.data.user = { id: verified.userId, sessionId: verified.sessionId };
      next();
    } catch (err) {
      next(err as Error);
    }
  });

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
  });

  setupRedisAdapter(io).catch((err) => {
    logger.error({ err }, "Falha ao configurar Redis adapter");
  });

  // Re-export para testes/consumidores que precisam do DTO.
  void toMessageDTO;

  return { httpServer, io };
}
