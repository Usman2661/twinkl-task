import { Database } from 'sqlite';

import { CreateUserDTO, User } from '../types/user';
import connectDB from '../database/database';

class UserService {
  private db: Database | undefined;

  private dbConnectionError: string | undefined;

  constructor() {
    connectDB()
      .then((db) => {
        this.db = db;
      })
      .catch((error) => {
        console.error('Error connecting to the database:', error.message);
        this.dbConnectionError = error.message;
      });
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    if (!this.db) {
      throw new Error(
        `Database is not connected with error ${this.dbConnectionError}`,
      );
    }

    const {
      fullName, email, password, userType, createdAt,
    } = user;

    const newUser = await this.db.run(
      'INSERT INTO users (fullName, email, password, userType, createdAt) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, password, userType, createdAt],
    );

    if (newUser.lastID === undefined) {
      throw new Error('Failed to create user');
    }

    return {
      id: newUser.lastID,
      fullName,
      email,
      userType,
      createdAt,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) {
      throw new Error(
        `Database is not connected with error ${this.dbConnectionError}`,
      );
    }
    const user = await this.db.get<User | null>(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );

    return user || null;
  }
}

export default UserService;
