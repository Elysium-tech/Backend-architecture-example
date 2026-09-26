import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "../../../database/prisma";
import { meUseCase } from "./me.use-case";
import { NotFoundError } from "../../../@types/errors/not-found-error";

describe("meUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the user profile when found", async () => {
    const fakeUser = {
      id: "user-123",
      email: "test@elysium.gg",
      username: "elysium_dev",
      displayName: "Elysium Dev",
      avatarUrl: "https://elysium.gg/avatar.png",
      bio: "Software Engineer",
      status: "ONLINE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser as any);

    const result = await meUseCase("user-123");

    expect(result).toEqual(fakeUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
      select: expect.any(Object),
    });
  });

  it("should throw NotFoundError if user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(meUseCase("non-existing-id")).rejects.toThrow(NotFoundError);
  });
});
