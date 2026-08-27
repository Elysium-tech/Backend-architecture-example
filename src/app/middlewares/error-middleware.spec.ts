import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../shared/logger", () => ({
  logger: { error: vi.fn() },
}));

import { errorMiddleware } from "./error-middleware";
import { AuthenticationError } from "../@types/errors/authentication-error";
import { ConflictError } from "../@types/errors/conflict-error";
import { ForbiddenError } from "../@types/errors/forbidden-error";
import { NotFoundError } from "../@types/errors/not-found-error";
import { UnauthorizedError } from "../@types/errors/unauthorized-error";
import { ValidationError } from "../@types/errors/validation-error";
import { InternalError } from "../@types/errors/internal-error";
import { SchemaValidationError } from "../@types/errors/schema-validation-error";
import { internalErrorCodes } from "../@types/errors/internal-error-codes";

describe("errorMiddleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let jsonMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnValue({ json: jsonMock }),
    };
    mockNext = vi.fn();
  });

  it("should handle AuthenticationError with status 401", () => {
    const error = new AuthenticationError("Invalid credentials");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 401,
        error: expect.objectContaining({
          code: internalErrorCodes.AUTHENTICATION_ERROR,
        }),
      })
    );
  });

  it("should handle ConflictError with status 409", () => {
    const error = new ConflictError("Already exists");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 409 })
    );
  });

  it("should handle ForbiddenError with status 403", () => {
    const error = new ForbiddenError("Access denied");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 403 })
    );
  });

  it("should handle NotFoundError with status 404", () => {
    const error = new NotFoundError("Not found");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 404 })
    );
  });

  it("should handle UnauthorizedError with status 401", () => {
    const error = new UnauthorizedError("Token invalid");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 401 })
    );
  });

  it("should handle ValidationError with status 400", () => {
    const error = new ValidationError("Invalid data");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  it("should handle SchemaValidationError with status 400", () => {
    const error = new SchemaValidationError("Schema mismatch");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  it("should handle InternalError with status 500", () => {
    const error = new InternalError();
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 500,
        error: expect.objectContaining({
          code: internalErrorCodes.INTERNAL_ERROR,
        }),
      })
    );
  });

  it("should handle generic Error with status 500", () => {
    const error = new Error("Something broke");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 500,
        error: expect.objectContaining({
          code: internalErrorCodes.INTERNAL_ERROR,
        }),
      })
    );
  });
});
