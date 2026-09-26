import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../database/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "../../../database/prisma";
import { getProfileUseCase } from "./get-profile.use-case";
import { NotFoundError } from "../../../@types/errors/not-found-error";

describe("getProfileUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fakeProfile = {
    id: "user-123",
    username: "elysium_dev",
    displayName: "Elysium Dev",
    avatarUrl: null,
    bio: "Hello world",
    status: "ONLINE",
    createdAt: new Date(),
  };

  it("should return public profile when searched by ID or username", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(fakeProfile as any);

    const result = await getProfileUseCase("elysium_dev");

    expect(result).toEqual(fakeProfile);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: "elysium_dev" }, { username: "elysium_dev" }],
      },
      select: expect.any(Object),
    });
  });

  it("should throw NotFoundError if user is not found", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(getProfileUseCase("non-existing")).rejects.toThrow(NotFoundError);
  });
});
