import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(30, "Username deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Username deve conter apenas letras, números e underscores"),
  displayName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
