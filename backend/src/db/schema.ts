import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Your Existing Authors Table
export const authorsTable = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
});

// 2. New Relational Posts Table
export const postsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  // Links directly to the author's id
  authorId: integer('author_id')
    .notNull()
    .references(() => authorsTable.id, { onDelete: 'cascade' }), 
});