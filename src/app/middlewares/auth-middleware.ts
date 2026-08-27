import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config";
import { UnauthorizedError } from "../@types/errors/unauthorized-error";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token não informado");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;
    next();
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}
