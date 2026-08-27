// Schemas globais reutilizáveis no OpenAPI
// Exemplo: ApiError, ApiResponse, Pagination

export const apiErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    status: { type: "number", example: 400 },
    message: { type: "string", example: "Erro interno do servidor" },
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "INTERNAL_ERROR" },
        details: {},
      },
    },
  },
};

export const apiResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    status: { type: "number", example: 200 },
    message: { type: "string", example: "success" },
    body: { type: "object" },
  },
};
