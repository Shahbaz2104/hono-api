
```markdown
# Publisher CMS & Author Analytics Dashboard

A modern, type-safe full-stack content management architecture designed as a clean workspace split between a high-performance backend REST API and a responsive admin analytics dashboard. Features strict relational data validation, nested cascade deletion safety rules, and real-time computation metrics.

---

## 🏗 Architecture Blueprint

The project is structured as a single unified repository managing two decoupled, highly interactive domains:

* **`backend/`**: Managed by Hono, using Zod for strict multi-table structural runtime validation, and Drizzle ORM to interface with an embedded local SQLite database.
* **`frontend/`**: Powered by Vite + React + TypeScript, executing reactive layout pipelines and state caching via TanStack Query, styled with Tailwind CSS and Lucide micro-vectors.

---

## 🛠 Tech Stack & Ecosystem

### Backend Architecture
* **Runtime Framework:** [Hono](https://hono.dev/) (Ultra-fast, lightweight web engine)
* **Database Layer:** [SQLite](https://sqlite.org/) (Local serverless database configuration)
* **ORM Engine:** [Drizzle ORM](https://orm.drizzle.team/) (TypeScript-first relational SQL mapper)
* **Schema Control:** [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) (Automated migrations & database pushes)
* **Data Validation:** [Zod](https://zod.dev/) (Strict contract schema validation)

### Frontend Engine
* **Build Architecture:** [Vite](https://vite.dev/) + React + TypeScript
* **Asynchronous Caching State:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
* **Interface Foundations:** [Tailwind CSS](https://tailwindcss.com/)
* **Micro-Interactions & Toasts:** [Sonner](https://sonner.emilkowal.ski/) (High-performance native toast streams)
* **Icon Suite:** [Lucide React](https://lucide.dev/)

---

## 📦 Directory Structure

```text
Hono Api/
├── backend/                  # Hono Core Framework Engine
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts      # Database Client Instantiation
│   │   │   └── schema.ts     # Relational Drizzle Table Schemas (One-to-Many)
│   │   ├── routes/
│   │   │   └── author.ts     # Validated Relational REST Endpoints
│   │   └── index.ts          # Main Server Gateway Entrypoint
│   ├── drizzle/              # Generated Migration Footprints
│   ├── drizzle.config.ts     # Drizzle Kit Sync Specifications
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Vite User Interface Workspace
│   ├── src/
│   │   ├── assets/           # Visual Dashboard Graph Assets
│   │   ├── App.tsx           # Dashboard Engine, Forms, & Analytics Computations
│   │   ├── index.css         # Global Tailwind Directives
│   │   └── main.tsx          # Client Dom Mount Entry Point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind Class Scanning Configuration
│   └── postcss.config.js
└── .gitignore                # Global Workspace Tracking Exclusions

```

---

## 🎛 Database Schemas & Runtime Validation

### 1. Relational Database Blueprints (Drizzle ORM)

The database sets up a structural **One-to-Many Relationship** between authors and posts, utilizing deep cascade rules:

```typescript
export const authorsTable = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
});

export const postsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => authorsTable.id, { onDelete: 'cascade' }), // Automatically purges history
});

```

### 2. Payload Validation Contracts (Zod)

```typescript
const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email(),
  age: z.coerce.number().min(18).optional().nullable()
});

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  authorId: z.number()
});

```

---

## 📊 Live Administrative Analytics Engine

The frontend dashboard performs real-time functional array reductions directly on the cached asynchronous state. The following operational parameters are dynamically computed on every mutation confirmation:

* **Total Authors Registered**: Direct evaluation of tracking length.
* **Total Posts Published**: Iterative reduction combining total lengths across all structural content records.
* **Top Contributor Leaderboard**: Live ranking algorithm tracing composition volume to identify the most active author.

---

## ⚡ Getting Started & Installation

### 1. Set Up the Local Environment Configurations

Ensure your project contains a root `.gitignore` to prevent tracking local dependencies and binaries:

```text
node_modules/
frontend/node_modules/
*.db
*.db-journal
*.sqlite
.env

```

### 2. Prepare and Run the Backend Engine

Navigate to the backend environment, install dependencies, and push your schema mappings to the local SQLite storage engine:

```bash
cd backend
npm install

# Push structural database schemas live via Drizzle-Kit
npx drizzle-kit push

# Boot up the server
npm run dev

```

The Hono backend API listener will open up at: `http://localhost:3000`

### 3. Start the Frontend Workspace

Open a secondary terminal instance, navigate to the user interface folder, and start the Vite compiler:

```bash
cd frontend
npm install
npm run dev

```

The client UI will spin up on your local machine at: `http://localhost:5173`

---

## 📡 API Endpoint Coverage Matrix

The Hono service routes SQL `LEFT JOIN` aggregations paired with input filters:

| HTTP Method | Route Gateway | Validation Guard | Operational Intent | Success Code |
| --- | --- | --- | --- | --- |
| **`GET`** | `/author` | None | Fetch all authors alongside a nested array of their posts | `200 OK` |
| **`POST`** | `/author` | `createAuthorSchema` | Validate and register a new author profile | `201 Created` |
| **`POST`** | `/author/post` | `createPostSchema` | Link and post a new article block to a profile | `201 Created` |
| **`DELETE`** | `/author/:id` | Route Param Check | Purges author and all their posts via CASCADE rules | `200 OK` |

*Bad requests failing Zod criteria are intercepted at the gateway, returning a `400 Bad Request` code with field-specific diagnostics, which the frontend displays using responsive toast notifications.*

```

```
