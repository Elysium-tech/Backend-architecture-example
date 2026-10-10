# ---------- builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências de sistema exigidas pelo Prisma (OpenSSL)
RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Instalação completa (com devDeps): o logger usa pino-pretty em runtime
# quando LOG_PRETTY é truthy — e z.coerce.boolean() converte "false" em true.
# Manter parity com o ambiente de dev evita crash no boot em produção.
# NOTA: ENV NODE_ENV=production fica DEPOIS do install, pois o npm omite
# devDependencies automaticamente quando NODE_ENV=production está setado.
RUN npm install --no-audit --no-fund && npx prisma generate

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Boot via migrations versionadas (Silex é dono de prisma/schema.prisma).
# Requer `prisma/migrations/*` geradas via `prisma migrate dev`.
# NÃO usar `db push` em produção: sem histórico/auditoria e com risco de drift.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
