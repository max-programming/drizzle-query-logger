export const CREATE_USERS_TABLE = `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  )
`;

export const CREATE_TODOS_TABLE = `
  CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    completed INTEGER DEFAULT 0,
    userId INTEGER REFERENCES users(id)
  )
`;

export const SEED_USERS_AND_TODOS = [
  `INSERT INTO users (name, email) VALUES ('John Doe', 'john.doe@example.com')`,
  `INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane.smith@example.com')`,
  `INSERT INTO todos (title, completed, userId) VALUES ('Buy groceries', 0, 1)`,
  `INSERT INTO todos (title, completed, userId) VALUES ('Finish project', 1, 2)`,
];
