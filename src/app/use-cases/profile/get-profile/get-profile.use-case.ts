import { prisma } from "../../../database/prisma";
import { NotFoundError } from "../../../@types/errors/not-found-error";

export async function getProfileUseCase(identifier: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { username: identifier }],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  return user;
}
