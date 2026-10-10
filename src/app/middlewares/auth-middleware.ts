import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config";
import { prisma } from "../database/prisma";
import { UnauthorizedError } from "../@types/errors/unauthorized-error";

interface JwtPayload {
  sub: string;
  sessionId: string;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token não informado");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token não informado");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Verify session exists and is not expired
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session if it exists
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedError("Sessão expirada ou inválida");
    }

    // Token binding: o JWT apresentado deve ser o mesmo gravado na sessão.
    // Revogação via logout deleta a sessão; rotação futura invalida tokens antigos.
    if (session.token !== token) {
      throw new UnauthorizedError("Sessão expirada ou inválida");
    }

    // Subject binding: o sub do JWT deve pertencer ao dono da sessão.
    if (session.userId !== decoded.sub) {
      throw new UnauthorizedError("Sessão expirada ou inválida");
    }

    req.user = {
      id: decoded.sub,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError("Token inválido ou expirado"));
    }
  }
}
