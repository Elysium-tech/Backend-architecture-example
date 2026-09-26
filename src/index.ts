import cors from "cors";
import express from "express";
import { env } from "./app/config";
import { logger } from "./shared/logger";
import { errorMiddleware } from "./app/middlewares/error-middleware";
import { authRoutes } from "./app/routes/auth.routes";
import { profileRoutes } from "./app/routes/profile.routes";
import { setupSwagger } from "./swagger/openapi/swagger";

const app = express();
app.use(cors());
app.use(express.json());

// Documentation
setupSwagger(app);

// Public routes
app.use("/auth", authRoutes);

// Private routes
app.use("/profile", profileRoutes);

app.use(errorMiddleware);

async function bootstrap() {
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Servidor iniciado");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Falha ao inicializar servidor");
  process.exit(1);
});

process.on("SIGINT", () => {
  logger.info("Encerrando servidor");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Encerrando servidor");
  process.exit(0);
});
