import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email"),
});

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey(),
  title: text("title"),
  completed: integer("completed").default(0),
  userId: integer("userId").references(() => users.id),
});

export const userRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));

export const todoRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}));
