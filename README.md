# Blog Module Starter (npm workspaces) — Postgres + Node.js + Next.js + TypeScript

## Porta DB in Docker
mapped on **5433** (avoid conflicts with local Postgres).

## Avvio rapido
1) copy `.env.example` → `packages/blog-core/.env` and `apps/web/.env`

2) start Postgres:
```bash
docker compose up -d
```

3) install and prepare database:
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

4) build package:
```bash
npm run --workspace=packages/blog-core build
npm run --workspace=packages/blog-cli build
```

5) create a tenant demo (if you need):
```bash
npm run blog -- create-tenant --name "Tenant Demo" --slug demo
```

6) start app:
```bash
npm run --workspace=apps/web dev
```
- Home → redirect a **/blog**
- Admin → **/admin** (BASIC da `.env`)
- Articoli → **/blog** e **/blog/[slug]**


