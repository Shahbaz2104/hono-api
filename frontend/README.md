# Publisher CMS — Frontend

React dashboard for the Publisher CMS backend: JWT login, paginated author management, and live analytics.

See the [root README](../README.md) for the full stack description and setup guide.

## Commands

```bash
npm install
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # typecheck (tsc -b) + production build
npm run lint     # ESLint
npm run preview  # preview the production build
```

## Proxy

The dev server proxies `/author` and `/auth` to `http://localhost:3000` (see `vite.config.ts`), so no environment variables are needed — start the backend first, then this.

## Structure

- `src/pages/` — Dashboard, AuthorDetail, Login
- `src/components/` — forms, list, modal, ProtectedRoute
- `src/hooks/` — TanStack Query hooks (`useAuthors`, `useAuthor`, `useAuthorStats`, `useAuthorOptions`)
- `src/lib/` — API client, token storage, shared types
