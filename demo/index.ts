import { eq } from "drizzle-orm";

import { db } from "./db";
import { todos, users } from "./db/tables";

const allUsers = await db.select().from(users);

const allTodos = await db.select().from(todos);

const userOneWithTodos = await db
  .select()
  .from(users)
  .where(eq(users.id, 1))
  .innerJoin(todos, eq(users.id, todos.userId));

const userTwoWithTodos = await db.query.users.findFirst({
  where: eq(users.id, 2),
  with: {
    todos: true,
  },
});

console.log(allUsers);
console.log(allTodos);
console.log(userOneWithTodos);
console.log(userTwoWithTodos);
