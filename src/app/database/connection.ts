import knex from "knex";
import { env } from "../config";

export const db = knex({
  client: "postgresql",
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
});
