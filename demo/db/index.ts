import { createClient } from "@libsql/client/sqlite3";
import { drizzle } from "drizzle-orm/libsql";
import { EnhancedQueryLogger } from "drizzle-query-logger";

import * as schema from "./tables";
import {
  CREATE_TODOS_TABLE,
  CREATE_USERS_TABLE,
  SEED_USERS_AND_TODOS,
} from "./queries";

const client = createClient({ url: ":memory:" });

client.execute(CREATE_USERS_TABLE);
client.execute(CREATE_TODOS_TABLE);
for (const query of SEED_USERS_AND_TODOS) {
  client.execute(query);
}

export const db = drizzle(client, {
  // logger: true,
  logger: new EnhancedQueryLogger(),
  schema,
});
