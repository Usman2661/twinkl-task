import { Database } from 'sqlite';
import bcrypt from 'bcrypt';

import { CreateUserDTO, User } from '../types/user';
import { connectDB } from '../database/database';
import logger from '../logger/logger';
import AppError from '../errors/error';
import ApiErrorTypes from '../types/error';

class UserService {
  private db: Database | undefined;

  private dbConnectionError: string | undefined;

  constructor() {
    connectDB()
      .then((db) => {
        this.db = db;
      })
      .catch((error) => {
        logger.error('Error connecting to the database:', error.message);
        this.dbConnectionError = error.message;
      });
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    if (!this.db) {
      throw new AppError(
        500,
        ApiErrorTypes.ServerError,
        `Database is not connected with error ${this.dbConnectionError}`,
      );
    }

    const {
      fullName, email, password, userType, createdAt,
    } = user;
    const newCreatedAt = createdAt || UserService.formatDate(new Date());
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const emailExists = await this.db.get(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (emailExists) {
      throw new AppError(
        400,
        ApiErrorTypes.ValidationError,
        `User with the provided email = ${email} already exists use a different email address`,
      );
    }

    const newUser = await this.db.run(
      'INSERT INTO users (fullName, email, password, userType, createdAt) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, userType, newCreatedAt],
    );

    if (newUser.lastID === undefined) {
      throw new AppError(
        500,
        ApiErrorTypes.ServerError,
        'Failed to create user',
      );
    }

    return {
      id: newUser.lastID,
      fullName,
      email,
      userType,
      createdAt: newCreatedAt,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) {
      throw new AppError(
        500,
        ApiErrorTypes.ServerError,
        `Database is not connected with error ${this.dbConnectionError}`,
      );
    }

    const user = await this.db.get<User | null>(
      'SELECT id, fullName, email, userType, createdAt FROM users WHERE deletedAt IS NULL AND id = ?',
      [id],
    );

    return user || null;
  }

  async softDeleteUserBydId(id: number): Promise<User | null> {
    if (!this.db) {
      throw new AppError(
        500,
        ApiErrorTypes.ServerError,
        `Database is not connected with error ${this.dbConnectionError}`,
      );
    }

    const user = await this.db.get<User | null>(
      'SELECT id, fullName, email, userType, createdAt FROM users WHERE deletedAt IS NULL AND id = ?',
      [id],
    );

    if (!user) {
      throw new AppError(
        404,
        ApiErrorTypes.NotFoundError,
        `There is no user with id = ${id}`,
      );
    }

    const currentDate = new Date(Date.now());
    const createdAtDate = new Date(user.createdAt);
    const differnceInMs = currentDate.getMilliseconds() - createdAtDate.getMilliseconds();
    const differenceInDays = differnceInMs / (1000 * 60 * 60 * 24);
    if (differenceInDays > 14) {
      throw new AppError(
        400,
        ApiErrorTypes.ValidationError,
        'User is over the trial period of 14 days',
      );
    }
    const deletedAt = UserService.formatDate(new Date());
    await this.db.run('UPDATE users SET deletedAt = ? WHERE id = ?', [
      deletedAt,
      id,
    ]);

    return {
      ...user,
      deletedAt,
    };
  }

  static formatDate(date: Date): string {
    const padTo2Digits = (num: number): string => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = padTo2Digits(date.getMonth() + 1);
    const day = padTo2Digits(date.getDate());
    const hours = padTo2Digits(date.getHours());
    const minutes = padTo2Digits(date.getMinutes());
    const seconds = padTo2Digits(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

export default UserService;
