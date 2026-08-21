import path from "path";
import { Knex } from "knex";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

import { env } from "./src/app/config";

const development: Knex.Config = {
  client: "postgresql",
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  seeds: {
    directory: "./src/app/database/seeds",
    loadExtensions: [".ts"],
    timestampFilenamePrefix: false,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/app/database/migrations",
  },
};

const production: Knex.Config = {
  client: "postgresql",
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  seeds: {
    directory: path.join(__dirname, "src/app/database/seeds"),
    loadExtensions: [".js"],
    timestampFilenamePrefix: false,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: path.join(__dirname, "src/app/database/migrations"),
  },
};

const config: { [key: string]: Knex.Config } = {
  development,
  production,
};

export default config;
