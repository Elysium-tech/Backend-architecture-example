import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  SALT_ROUNDS: z.coerce.number().default(10),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  BACKEND_URL: z.string().default("http://localhost:3000"),
  LOG_PRETTY: z.coerce.boolean().default(true),
  RUN_MIGRATIONS_ON_STARTUP: z.coerce.boolean().default(false),
  RUN_SEEDS_ON_STARTUP: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
