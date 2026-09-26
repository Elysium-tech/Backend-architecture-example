import { prisma } from "../../../database/prisma";
import { NotFoundError } from "../../../@types/errors/not-found-error";

export async function meUseCase(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  return user;
}
