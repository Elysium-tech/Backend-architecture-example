import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mocked_jwt_token"),
  },
}));

import bcrypt from "bcryptjs";
import { prisma } from "../../../database/prisma";
import { loginUseCase } from "./login.use-case";
import { AuthenticationError } from "../../../@types/errors/authentication-error";

describe("loginUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = {
    email: "test@elysium.gg",
    password: "correctPassword",
  };

  const fakeUser = {
    id: "user-123",
    email: input.email,
    username: "elysium_dev",
    displayName: "Elysium Dev",
    passwordHash: "hashed_pass",
    avatarUrl: null,
    status: "OFFLINE",
    createdAt: new Date(),
  };

  it("should authenticate user, create session and set status to ONLINE", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "session-123",
      userId: "user-123",
      token: "",
      expiresAt: new Date(),
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.session.update).mockResolvedValue({} as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const result = await loginUseCase(input, "vitest-agent", "127.0.0.1");

    expect(result.user.status).toBe("ONLINE");
    expect(result.token).toBe("mocked_jwt_token");
    expect(prisma.session.create).toHaveBeenCalledOnce();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { status: "ONLINE" },
    });
  });

  it("should throw AuthenticationError if user is not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(loginUseCase(input)).rejects.toThrow(AuthenticationError);
  });

  it("should throw AuthenticationError if password does not match", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(loginUseCase(input)).rejects.toThrow(AuthenticationError);
  });
});
