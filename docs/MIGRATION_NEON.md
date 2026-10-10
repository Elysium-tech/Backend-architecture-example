# Migração SQLite → Neon Postgres (Fase 1 — DB)

Escopo desta fase: SOMENTE `prisma/*` + `.env.example` + este doc.
`src/`, `Dockerfile` e `docker-compose.yml` são do Forja (outra fase).

## O que já foi feito (sem credenciais)

- `prisma/schema.prisma`: provider `postgresql`, `url` + `directUrl`,
  modelos `User`/`Session` mantidos + `Guild`/`Channel`/`ChannelMember`/
  `Message` (`clientMessageId` unique)/`Reaction`, tudo `onDelete: Cascade`,
  `@@index` em `Session(userId, expiresAt)` e `Message(channelId, createdAt)`.
- `prisma/migrations/20261010000000_init/migration.sql`: gerado OFFLINE via
  `prisma migrate diff --from-empty --to-schema-datamodel` (7 tabelas,
  13 índices, 9 FKs). NÃO aplicado em banco nenhum — requer Neon.
- `prisma validate` + `prisma format`: OK.
- `.env.example`: documenta `DATABASE_URL` (pooled) + `DIRECT_URL` (direct).

## 0. Backup do SQLite atual

```bash
cd Backend-hermes
cp prisma/dev.db /tmp/opencode/dev-backup-$(date +%F).db
# Tabelas hoje vazias (0 linhas); se houver dados: sqlite3 .dump > backup.sql
```

## 1. Criar projeto Neon (falta: credenciais)

1. https://console.neon.tech → New Project (Free, região próxima).
2. Connect → copiar string POOLED e string DIRECT.
3. Criar branch `dev` (branching por ambiente/PR).
4. Preencher `.env` local a partir do `.env.example` (nunca commitar).

## 2. Aplicar migration no Neon

```bash
# confere o plano sem aplicar:
npx prisma migrate diff \
  --from-url "$DIRECT_URL" \
  --to-migrations ./prisma/migrations --script
# aplica (a pasta 20261010000000_init será marcada como aplicada):
npx prisma migrate deploy
# ou, em dev com shadow DB: npx prisma migrate dev
npx prisma generate
```

## 3. Validar

- `npx prisma studio` → confere 7 tabelas.
- E2E (fase Forja): register → login → me → logout.
- Checar cascade: deletar `User` remove `Session`/guildas/mensagens.

## 4. Rollback para branch SQLite

```bash
git stash list # ou: git checkout <branch-sqlite> -- prisma/schema.prisma
# schema volta a: provider "sqlite", url file:./dev.db (sem directUrl)
# apagar prisma/migrations, restaurar: cp /tmp/opencode/dev-backup-*.db prisma/dev.db
npx prisma generate
```

Pendente conhecido (não bloqueia Fase 1): `register`/`login` criam
`Session` com `token: ""` antes do update — como `token` é unique,
há colisão sob concorrência. Corrigir em fase de código (Forja ou
follow-up): `token String? @unique` ou pré-gerar id + `$transaction`.
