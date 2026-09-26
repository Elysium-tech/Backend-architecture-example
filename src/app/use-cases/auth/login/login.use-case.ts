import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../database/prisma";
import { env } from "../../../config";
import { AuthenticationError } from "../../../@types/errors/authentication-error";
import { LoginInput } from "./login.schema";

export async function loginUseCase(input: LoginInput, userAgent?: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthenticationError();
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AuthenticationError();
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: "",
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

  // Update user status to ONLINE
  await prisma.user.update({
    where: { id: user.id },
    data: { status: "ONLINE" },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: "ONLINE",
      createdAt: user.createdAt,
    },
    token,
  };
}
