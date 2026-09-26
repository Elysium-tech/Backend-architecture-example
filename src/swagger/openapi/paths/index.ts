export const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Criar uma nova conta de usuário",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "username", "displayName", "password"],
              properties: {
                email: { type: "string", format: "email", example: "user@elysium.gg" },
                username: { type: "string", example: "elysium_dev" },
                displayName: { type: "string", example: "Elysium Dev" },
                password: { type: "string", format: "password", example: "12345678" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Conta criada com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ApiResponse",
              },
            },
          },
        },
        400: { description: "Erro de validação nos campos informados" },
        409: { description: "E-mail ou username já em uso" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Autenticar usuário e iniciar sessão",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "user@elysium.gg" },
                password: { type: "string", format: "password", example: "12345678" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login realizado com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ApiResponse",
              },
            },
          },
        },
        400: { description: "Erro de validação" },
        401: { description: "Credenciais inválidas" },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Encerrar sessão atual do usuário",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Logout realizado com sucesso" },
        401: { description: "Não autorizado" },
      },
    },
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Obter perfil do usuário autenticado",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Dados do usuário autenticado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ApiResponse",
              },
            },
          },
        },
        401: { description: "Não autorizado" },
      },
    },
  },
};

export const profilePaths = {
  "/profile/{id}": {
    get: {
      tags: ["Profile"],
      summary: "Obter perfil público por ID ou username",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID ou username do usuário",
        },
      ],
      responses: {
        200: { description: "Perfil encontrado com sucesso" },
        404: { description: "Usuário não encontrado" },
      },
    },
  },
  "/profile/me": {
    patch: {
      tags: ["Profile"],
      summary: "Atualizar próprio perfil",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                displayName: { type: "string", example: "Novo Nome" },
                bio: { type: "string", example: "Bio personalizada no Elysium" },
                avatarUrl: { type: "string", format: "uri", example: "https://example.com/avatar.png" },
                status: {
                  type: "string",
                  enum: ["ONLINE", "OFFLINE", "IDLE", "DO_NOT_DISTURB"],
                  example: "ONLINE",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Perfil atualizado com sucesso" },
        400: { description: "Erro de validação" },
        401: { description: "Não autorizado" },
      },
    },
  },
};

export const paths = {
  ...authPaths,
  ...profilePaths,
};
