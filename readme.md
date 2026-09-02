# Elysium Backend

API REST do sistema Elysium, construída com **Node.js**, **TypeScript**, **Express** e **Knex** (PostgreSQL).

---

## 🚀 Tecnologias

| Ferramenta | Uso |
|---|---|
| [Node.js](https://nodejs.org) | Runtime |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Express 5](https://expressjs.com) | Framework HTTP |
| [Knex](https://knexjs.org) | Query builder / Migrations |
| [PostgreSQL](https://www.postgresql.org) | Banco de dados |
| [Zod](https://zod.dev) | Validação de schemas e env |
| [Pino](https://getpino.io) | Logger estruturado |
| [Vitest](https://vitest.dev) | Testes unitários e de integração |
| [Swagger UI](https://swagger.io/tools/swagger-ui) | Documentação da API |

---

## 📁 Estrutura de Pastas

```
src/
├── index.ts                    # Entry point — inicializa servidor e middlewares
├── app/
│   ├── config/                 # Variáveis de ambiente validadas com Zod
│   ├── cron/                   # Agendamento de tarefas (cron jobs)
│   ├── database/
│   │   ├── connection.ts       # Instância do Knex
│   │   ├── migrations/         # Arquivos de migration do banco
│   │   └── seeds/              # Seeds de dados iniciais
│   ├── enums/                  # Enums compartilhados da aplicação
│   ├── middlewares/
│   │   ├── auth-middleware.ts  # Autenticação JWT
│   │   └── error-middleware.ts # Tratamento global de erros
│   ├── models/                 # Interfaces/tipos das entidades do banco
│   ├── permissions/            # Regras de permissão por role
│   ├── queue/
│   │   ├── consumers/          # Consumidores de fila de mensagens
│   │   ├── handlers/           # Handlers de processamento das mensagens
│   │   └── producers/          # Produtores / publicadores de eventos
│   ├── routes/                 # Definição das rotas por módulo
│   ├── services/
│   │   └── email/              # Contrato e implementação do serviço de e-mail
│   ├── @types/
│   │   ├── api/                # ApiResponse, ApiError e ApiResponseFactory
│   │   ├── errors/             # Erros HTTP tipados (InternalError, ValidationError, etc.)
│   │   └── session/            # Extensões de tipo do Express Request
│   ├── use-cases/              # Casos de uso por domínio (um subdiretório por recurso)
│   └── utils/                  # Funções utilitárias gerais
├── scripts/                    # Scripts utilitários de desenvolvimento
├── shared/
│   └── logger.ts               # Logger Pino compartilhado
├── swagger/
│   ├── modules/                # Schemas Swagger por módulo
│   └── openapi/
│       ├── helpers/            # Helpers de responses OpenAPI
│       ├── paths/              # Paths registrados da API
│       ├── schemas/            # Schemas globais reutilizáveis
│       └── swagger.ts          # Setup do Swagger UI
└── test/
    ├── setup.ts                # Setup global do Vitest (beforeAll/afterAll)
    ├── factories.ts            # Factories de dados para testes
    └── helpers.ts              # Utilitários de teste
```

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd elysium-backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente (`development` / `production`) | `development` |
| `DATABASE_URL` | URL de conexão PostgreSQL | — |
| `JWT_SECRET` | Segredo para assinar tokens JWT | — |
| `SALT_ROUNDS` | Rounds de hash bcrypt | `10` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:5173` |
| `LOG_PRETTY` | Log formatado no terminal | `true` |
| `RUN_MIGRATIONS_ON_STARTUP` | Roda migrations ao iniciar | `false` |
| `RUN_SEEDS_ON_STARTUP` | Roda seeds ao iniciar | `false` |

---

## 🛠️ Scripts

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Banco de dados
npm run db:migrate           # Aplica migrations pendentes
npm run db:migrate:rollback  # Desfaz a última migration
npm run db:seed              # Executa os seeds

# Testes
npm run test                 # Executa todos os testes
npm run test:watch           # Modo watch
npm run test:coverage        # Relatório de cobertura

# Formatação
npm run format               # Prettier em todo o projeto

# Geração de use-cases
npm run generate:use-case -- users create

# Auditoria da documentação OpenAPI
npm run audit:swagger
```

---

## 📐 Padrão de Módulos (Use Cases)

Cada domínio da aplicação segue a seguinte estrutura dentro de `src/app/use-cases/`:

```
use-cases/
└── <recurso>/
    ├── <acao>-<recurso>.use-case.ts   # Lógica de negócio
    ├── <recurso>.repository.ts         # Acesso ao banco via Knex
    ├── <recurso>.dto.ts                # DTOs de entrada/saída
    └── <recurso>.spec.ts               # Testes do use case
```

As rotas ficam em `src/app/routes/<recurso>.routes.ts` e importam diretamente os use cases.

---

## 📖 Documentação da API

Com o servidor rodando, acesse:

```
http://localhost:3000/api-docs
```

---

## 🧪 Testes

```bash
npm run test:coverage
```

A cobertura mínima configurada é **40%** para statements, branches, funções e linhas.

---

## 📄 Licença

ISC
