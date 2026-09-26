import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { paths } from "./paths";
import { apiErrorSchema, apiResponseSchema } from "./schemas";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Elysium Backend API",
    version: "1.0.0",
    description: "Plataforma de comunicação Elysium (Chat, Voz, Perfil e Sessão)",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiResponse: apiResponseSchema,
      ApiError: apiErrorSchema,
    },
  },
  paths,
};

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
