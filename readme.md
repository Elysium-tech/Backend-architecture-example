# 🎮 Elysium Backend

API REST da plataforma de comunicação **Elysium** (estilo Discord — chat, voz, compartilhamento de tela), construída com **Node.js**, **TypeScript**, **Express 5** e **Prisma ORM** com **SQLite** (`dev.db`).

---

## 🚀 Tecnologias

| Ferramenta | Uso |
|---|---|
| [Node.js](https://nodejs.org) | Runtime (v20+) |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Express 5](https://expressjs.com) | Framework HTTP |
| [Prisma ORM](https://www.prisma.io) | ORM com type-safety e migrations |
| [SQLite](https://www.sqlite.org) (`dev.db`) | Banco de dados local para desenvolvimento |
| [Zod](https://zod.dev) | Validação de schemas e variáveis de ambiente |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Criptografia de senhas |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Autenticação baseada em JWT com controle de sessão |
| [Pino](https://getpino.io) | Logger estruturado de alta performance |
| [Vitest](https://vitest.dev) | Testes unitários e de integração |
| [Swagger UI](https://swagger.io/tools/swagger-ui) | Documentação interativa OpenAPI |

---

## 📁 Estrutura do Projeto

```
src/
├── index.ts                           # Entry point — inicializa Express, Swagger e rotas
├── app/
│   ├── config/                        # Variáveis de ambiente validadas com Zod
│   ├── database/
│   │   └── prisma.ts                  # Client singleton do Prisma
│   ├── enums/                         # Enums da aplicação (UserStatus, etc.)
│   ├── middlewares/
│   │   ├── auth-middleware.ts         # Validação de JWT e verificação de Sessão ativa no SQLite
│   │   └── error-middleware.ts        # Tratamento global de erros
│   ├── models/                        # Interfaces e tipos derivados do Prisma
│   ├── routes/
│   │   ├── auth.routes.ts             # Rotas de cadastro, login, logout e me
│   │   ├── profile.routes.ts          # Rotas de consulta e edição de perfil
│   │   └── index.ts                   # Exportação unificada das rotas
│   ├── @types/
│   │   ├── api/                       # ApiResponse, ApiError e ApiResponseFactory
│   │   ├── errors/                    # Erros HTTP tipados (UnauthorizedError, ConflictError, etc.)
│   │   └── session/                   # Extensão da interface Request do Express (req.user)
│   └── use-cases/
│       ├── auth/
│       │   ├── register/              # Cadastro de novo usuário
│       │   ├── login/                 # Autenticação e criação de sessão
│       │   ├── logout/                # Encerramento e revogação de sessão
│       │   └── me/                    # Dados do usuário logado
│       └── profile/
│           ├── get-profile/           # Obter perfil por ID ou username
│           └── update-profile/        # Atualizar displayName, bio, avatar, status
├── shared/
│   └── logger.ts                      # Logger Pino compartilhado
└── swagger/
    └── openapi/                       # Especificação OpenAPI e Swagger UI em /api-docs

prisma/
└── schema.prisma                      # Schema de banco de dados SQLite (User, Session)
```

---

## 📦 Modelo de Dados (Prisma)

### `User`
- `id`: String (UUID)
- `email`: String (único)
- `username`: String (único)
- `displayName`: String
- `passwordHash`: String (bcrypt)
- `avatarUrl`: String? (opcional)
- `bio`: String? (opcional)
- `status`: String (`ONLINE`, `OFFLINE`, `IDLE`, `DO_NOT_DISTURB`)
- `createdAt` / `updatedAt`: DateTime
- `sessions`: Session[]

### `Session`
- `id`: String (UUID)
- `userId`: String (FK -> User)
- `token`: String (único)
- `userAgent`: String?
- `ipAddress`: String?
- `expiresAt`: DateTime
- `createdAt`: DateTime

---

## 🔌 Endpoints da API

### Autenticação (`/auth`)

| Método | Rota | Autenticado | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ Não | Cria conta de usuário, inicializa sessão e devolve JWT |
| `POST` | `/auth/login` | ❌ Não | Valida credenciais, gera sessão no banco e devolve JWT |
| `POST` | `/auth/logout` | ✅ Sim | Revoga a sessão atual no banco e atualiza status para OFFLINE |
| `GET` | `/auth/me` | ✅ Sim | Retorna os dados completos do usuário autenticado |

### Perfil (`/profile`)

| Método | Rota | Autenticado | Descrição |
|---|---|---|---|
| `GET` | `/profile/:id` | ✅ Sim | Consulta perfil público por ID ou username |
| `PATCH` | `/profile/me` | ✅ Sim | Atualiza displayName, bio, avatarUrl e status |

---

## ⚙️ Inicialização do Projeto

### 1. Instalar dependências

No terminal da sua máquina:

```bash
npm install
```

### 2. Gerar o Prisma Client e sincronizar o banco SQLite

```bash
# Sincroniza o schema diretamente com o banco dev.db
npm run db:push

# Ou criar migration
npm run db:migrate
```

### 3. Rodar a aplicação em modo desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

---

## 📖 Documentação Interativa (Swagger)

Acesse no navegador com o servidor rodando:

```
http://localhost:3000/api-docs
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com tsx watch (hot reload)
npm run build            # Compila TypeScript para ./dist

# Banco de dados (Prisma + SQLite)
npm run db:push          # Sincroniza schema.prisma com o arquivo dev.db
npm run db:migrate       # Cria e aplica migrações do Prisma
npm run db:studio        # Interface web do Prisma para visualizar dados
npm run prisma:generate  # Regenera os tipos do Prisma Client

# Testes e Qualidade
npm run test             # Executa a suite de testes (Vitest)
npm run test:coverage    # Executa testes com relatório de cobertura
npm run format           # Formatação automática com Prettier
```
