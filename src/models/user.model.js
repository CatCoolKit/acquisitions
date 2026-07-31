import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name', { length: 255 }).notNull(),
  email: text('email', { length: 255 }).notNull().unique(),
  password: text('password', { length: 255 }).notNull(),
  role: text('role', { length: 50 }).notNull().default('user'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
