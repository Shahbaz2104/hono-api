import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

// 1. Authors Table
export const authorsTable = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
});

// 2. Relational Posts Table
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  // Links directly to the author's id
  authorId: integer('author_id')
    .notNull()
    .references(() => authorsTable.id, { onDelete: 'cascade' }),
});

export const authorsRelations = relations(authorsTable, ({ many }) => ({
  posts: many(postsTable),
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
  author: one(authorsTable, {
    fields: [postsTable.authorId],
    references: [authorsTable.id],
  }),
}));
