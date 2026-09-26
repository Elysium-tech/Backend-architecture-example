import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../../../database/prisma";
import { updateProfileUseCase } from "./update-profile.use-case";
import { NotFoundError } from "../../../@types/errors/not-found-error";

describe("updateProfileUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const existingUser = {
    id: "user-123",
    email: "user@elysium.gg",
    username: "user_test",
    displayName: "Old Name",
    bio: null,
    avatarUrl: null,
    status: "ONLINE",
  };

  it("should update profile fields successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...existingUser,
      displayName: "New Name",
      bio: "New Bio",
      status: "IDLE",
    } as any);

    const result = await updateProfileUseCase("user-123", {
      displayName: "New Name",
      bio: "New Bio",
      status: "IDLE",
    });

    expect(result.displayName).toBe("New Name");
    expect(result.bio).toBe("New Bio");
    expect(result.status).toBe("IDLE");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: expect.objectContaining({
        displayName: "New Name",
        bio: "New Bio",
        status: "IDLE",
      }),
      select: expect.any(Object),
    });
  });

  it("should throw NotFoundError if user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      updateProfileUseCase("non-existing", { displayName: "New Name" })
    ).rejects.toThrow(NotFoundError);
  });
});
