import sqlite3 from 'sqlite3';

import { open, Database } from 'sqlite';
import logger from '../logger/logger';

const connectDB = async (
  createSchema: boolean = false,
): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  try {
    const db = await open({
      filename: './src/database/database.sqlite',
      driver: sqlite3.Database,
    });

    if (createSchema) {
      await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      createdAt DATETIME,
      userType TEXT CHECK(userType IN ('student', 'teacher', 'parent', 'private tutor')) NOT NULL
    );
  `);
    }

    return db;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export default connectDB;
