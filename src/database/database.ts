import sqlite3 from 'sqlite3';

import { open, Database } from 'sqlite';

const connectDB = async (): Promise<
Database<sqlite3.Database, sqlite3.Statement>
> => {
  const db = await open({
    filename: './src/database/database.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_type TEXT CHECK(user_type IN ('student', 'teacher', 'parent', 'private tutor')) NOT NULL
    );
  `);

  return db;
};

export default connectDB;
