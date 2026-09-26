// Modelos são gerados pelo Prisma Client automaticamente.
// Use `import { User, Session } from "@prisma/client"` para acessar os tipos.
//
// Este arquivo pode ser usado para definir interfaces derivadas
// (ex: sem campos sensíveis) quando necessário.

import { User } from "@prisma/client";

/** User sem campos sensíveis (passwordHash) */
export type PublicUser = Omit<User, "passwordHash">;
