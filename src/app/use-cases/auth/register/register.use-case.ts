import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../database/prisma";
import { env } from "../../../config";
import { ConflictError } from "../../../@types/errors/conflict-error";
import { RegisterInput } from "./register.schema";

export async function registerUseCase(input: RegisterInput, userAgent?: string, ipAddress?: string) {
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) {
    throw new ConflictError("E-mail já cadastrado");
  }

  const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
  if (existingUsername) {
    throw new ConflictError("Username já em uso");
  }

  const passwordHash = await bcrypt.hash(input.password, env.SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash,
    },
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: "", // will be updated below
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  const token = jwt.sign(
    { sub: user.id, sessionId: session.id },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await prisma.session.update({
    where: { id: session.id },
    data: { token },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    },
    token,
  };
}
