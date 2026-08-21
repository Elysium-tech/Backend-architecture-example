import pino from "pino";
import { env } from "../app/config";

export const logger = pino(
  env.LOG_PRETTY
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}
);
