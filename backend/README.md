# Publisher CMS — Backend

Hono REST API with Drizzle ORM on PostgreSQL, Zod validation, and JWT auth.

See the [root README](../README.md) for the full API reference, architecture, and setup guide.

## Commands

```bash
npm install
npm run dev            # dev server with reload (http://localhost:3000)
npm run build          # compile TypeScript to dist/
npm start              # run the compiled build
npm test               # Vitest suite against in-process PGlite
npm run test:watch     # watch mode
npx drizzle-kit push   # apply schema to the DATABASE_URL database
npx drizzle-kit generate  # generate a migration from schema changes
```

## Environment

Copy `.env.example` to `.env`:

```bash
DATABASE_URL=postgres://user@localhost:5432/dbname
PORT=3000
NODE_ENV=development
JWT_SECRET=<random 32+ characters>   # e.g. openssl rand -base64 32
CLIENT_ORIGIN=http://localhost:5173
```

## Testing

Tests run against [PGlite](https://pglite.dev) (Postgres compiled to WASM) — no database server, Docker, or network required. `npm test` works on a fresh clone after `npm install`.
