// Arquivo de configuração do Swagger/OpenAPI
// Registre aqui todos os schemas e paths da API

import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Elysium Backend API",
    version: "1.0.0",
    description: "Documentação da API do backend",
  },
  paths: {},
};

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
