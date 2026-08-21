// Schemas globais reutilizáveis no OpenAPI
// Exemplo: ApiError, ApiResponse, Pagination

export const apiErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Erro interno do servidor" },
  },
};

export const apiResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: { type: "object" },
  },
};
