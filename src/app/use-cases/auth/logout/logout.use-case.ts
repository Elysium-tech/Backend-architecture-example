import { prisma } from "../../../database/prisma";

export async function logoutUseCase(sessionId: string, userId: string) {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });

  // Check if user has any remaining active sessions
  const remainingSessions = await prisma.session.count({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
  });

  // If no active sessions remain, set user status to OFFLINE
  if (remainingSessions === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "OFFLINE" },
    });
  }
}
