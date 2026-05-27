# Publisher CMS & Author Analytics Dashboard

A modern, type-safe full-stack content management system designed as a clean workspace split between a high-performance backend REST API and a responsive admin analytics dashboard. It features strict relational data validation, cascade deletion safety rules, and real-time analytics computation.

---

# 🏗 Architecture Blueprint

The project is organized as a unified monorepo containing two decoupled domains:

* **`backend/`**
  Built with Hono, powered by Zod runtime validation and Drizzle ORM connected to a local SQLite database.

* **`frontend/`**
  Built with Vite + React + TypeScript, using TanStack Query for state management and Tailwind CSS for responsive UI styling.

---

# 🛠 Tech Stack & Ecosystem

## Backend Architecture

* **Runtime Framework:**
  [Hono](https://hono.dev?utm_source=chatgpt.com) — Ultra-fast lightweight web framework

* **Database Layer:**
  [SQLite](https://sqlite.org?utm_source=chatgpt.com) — Embedded serverless relational database

* **ORM Engine:**
  [Drizzle ORM](https://orm.drizzle.team?utm_source=chatgpt.com) — TypeScript-first SQL ORM

* **Migration & Schema Tooling:**
  [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview?utm_source=chatgpt.com) — Automated schema migration management

* **Validation Engine:**
  [Zod](https://zod.dev?utm_source=chatgpt.com) — Runtime-safe schema validation

---

## Frontend Architecture

* **Frontend Framework:**
  [Vite](https://vite.dev?utm_source=chatgpt.com) + React + TypeScript

* **Server State Management:**
  [TanStack Query v5](https://tanstack.com/query/latest?utm_source=chatgpt.com)

* **Styling System:**
  [Tailwind CSS](https://tailwindcss.com?utm_source=chatgpt.com)

* **Toast Notifications:**
  [Sonner](https://sonner.emilkowal.ski?utm_source=chatgpt.com)

* **Icon Library:**
  [Lucide React](https://lucide.dev?utm_source=chatgpt.com)

---

# 📦 Directory Structure

```text
Hono Api/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── routes/
│   │   │   └── author.ts
│   │   └── index.ts
│   │
│   ├── drizzle/
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── .gitignore
```

---

# 🎛 Database Schemas & Runtime Validation

## 1. Relational Database Blueprint (Drizzle ORM)

The application establishes a **One-to-Many** relationship between authors and posts using cascading delete rules.

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
    .references(() => authorsTable.id, {
      onDelete: 'cascade',
    }),
});
```

---

## 2. Payload Validation Contracts (Zod)

```typescript
const createAuthorSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email(),
  age: z.coerce.number().min(18).optional().nullable(),
});

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  authorId: z.number(),
});
```

---

# 📊 Live Administrative Analytics Engine

The frontend dashboard computes live analytics directly from cached asynchronous state.

### Real-Time Metrics

* **Total Authors Registered**
  Counts all active author records.

* **Total Posts Published**
  Aggregates post counts across all authors.

* **Top Contributor Leaderboard**
  Dynamically ranks authors by total published posts.

---

# ⚡ Getting Started & Installation

## 1. Configure `.gitignore`

Create a root `.gitignore` file:

```gitignore
node_modules/
frontend/node_modules/
*.db
*.db-journal
*.sqlite
.env
```

---

## 2. Start the Backend Server

```bash
cd backend

npm install

# Push Drizzle schemas to SQLite
npx drizzle-kit push

# Start development server
npm run dev
```

Backend server runs at:

```text
http://localhost:3000
```

---

## 3. Start the Frontend Application

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# 📡 API Endpoint Coverage Matrix

The backend exposes validated REST endpoints with relational aggregation support.

| Method   | Route          | Validation             | Purpose                             | Status        |
| -------- | -------------- | ---------------------- | ----------------------------------- | ------------- |
| `GET`    | `/author`      | None                   | Fetch all authors with nested posts | `200 OK`      |
| `POST`   | `/author`      | `createAuthorSchema`   | Create a new author profile         | `201 Created` |
| `POST`   | `/author/post` | `createPostSchema`     | Create a post linked to an author   | `201 Created` |
| `DELETE` | `/author/:id`  | Route param validation | Delete author and cascade posts     | `200 OK`      |

---

# ✅ Validation & Error Handling

Requests failing Zod validation are intercepted before database execution and return structured validation responses.

Example response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

The frontend consumes these responses and displays interactive toast notifications using Sonner.

---

# 🚀 Key Features

* Type-safe full-stack architecture
* Runtime validation with Zod
* SQLite relational persistence
* Drizzle ORM schema management
* Cascade deletion safety
* Reactive analytics dashboard
* Real-time query synchronization
* Toast-based feedback system
* Modern responsive UI
* Fully modular project structure
