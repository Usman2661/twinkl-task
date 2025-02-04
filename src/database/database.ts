import sqlite3 from 'sqlite3';

import { open, Database } from 'sqlite';
import logger from '../logger/logger';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const connectDB = async (
  createSchema: boolean = false,
  runMigrations: boolean = false,
): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  try {
    if (dbInstance) {
      return dbInstance;
    }

    dbInstance = await open({
      filename: './src/database/database.sqlite',
      driver: sqlite3.Database,
    });

    if (createSchema) {
      await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      createdAt DATETIME,
      userType TEXT CHECK(userType IN ('student', 'teacher', 'parent', 'private tutor')) NOT NULL
    );
  `);

      await dbInstance.exec(`
      ALTER TABLE users ADD COLUMN deletedAt DATETIME;
  `);
    }

    if (runMigrations) {
      await dbInstance.migrate({
        migrationsPath: './src/database/migrations',
      });
    }

    return dbInstance;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const closeDb = async (): Promise<void> => {
  try {
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing the database connection:', error);
  }
};

export { connectDB, closeDb };
