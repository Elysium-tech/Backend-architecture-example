import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../database/prisma", () => ({
  prisma: {
    session: {
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../../../database/prisma";
import { logoutUseCase } from "./logout.use-case";

describe("logoutUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete session and set user OFFLINE if no active sessions remain", async () => {
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.session.count).mockResolvedValue(0);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await logoutUseCase("session-123", "user-123");

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { id: "session-123" },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { status: "OFFLINE" },
    });
  });

  it("should not set user OFFLINE if other active sessions still exist", async () => {
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.session.count).mockResolvedValue(2); // still has 2 active sessions

    await logoutUseCase("session-123", "user-123");

    expect(prisma.session.deleteMany).toHaveBeenCalledOnce();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
