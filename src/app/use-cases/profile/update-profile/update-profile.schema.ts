import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .optional(),
  bio: z
    .string()
    .max(300, "Bio deve ter no máximo 300 caracteres")
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url("URL do avatar inválida")
    .optional()
    .nullable(),
  status: z
    .enum(["ONLINE", "OFFLINE", "IDLE", "DO_NOT_DISTURB"], {
      message: "Status inválido",
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
