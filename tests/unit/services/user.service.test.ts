import bcrypt from 'bcrypt';
import { Database } from 'sqlite';

import UserService from '../../../src/services/users.service';
import { UserType } from '../../../src/types/user';
import ApiErrorTypes from '../../../src/types/error';
import AppError from '../../../src/errors/error';

jest.mock('sqlite');
jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let dbMock: Partial<Database>;
  const mockDate = '2025-01-01 00:00:00';

  beforeEach(() => {
    dbMock = {
      get: jest.fn(),
      run: jest.fn(),
    };

    userService = new UserService();
    (userService as any).db = dbMock as Database;
  });

  describe('createUser', () => {
    it('should create a new user when valid data is provided', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        userType: UserType.parent,
        createdAt: mockDate,
      };

      (userService as any).db = dbMock;
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      (dbMock.get as jest.Mock).mockResolvedValue(null);

      (dbMock.run as jest.Mock).mockResolvedValue({ lastID: 1 });

      const result = await userService.createUser(newUser);

      expect(result).toEqual({
        id: 1,
        fullName: newUser.fullName,
        email: newUser.email,
        userType: newUser.userType,
        createdAt: mockDate,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(dbMock.get).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', [newUser.email]);
      expect(dbMock.run).toHaveBeenCalledWith(
        'INSERT INTO users (fullName, email, password, userType, createdAt) VALUES (?, ?, ?, ?, ?)',
        [newUser.fullName, newUser.email, 'hashedPassword', newUser.userType, mockDate],
      );
    });

    it('should throw an error if email already exists', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        userType: UserType.parent,
        createdAt: mockDate,
      };

      (userService as any).db = dbMock;
      (dbMock.get as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(userService.createUser(newUser)).rejects.toThrow(
        new AppError(400, ApiErrorTypes.ValidationError, `User with the provided email = ${newUser.email} already exists use a different email address`),
      );
    });

    it('should throw an error if database is not connected', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        userType: UserType.teacher,
        createdAt: mockDate,
      };

      (userService as any).db = undefined;

      await expect(userService.createUser(newUser)).rejects.toThrow(
        new AppError(500, ApiErrorTypes.ServerError, 'Database is not connected with error undefined'),
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user by id when the user exists', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
        userType: 'student',
        createdAt: mockDate,
      };

      (userService as any).db = dbMock;
      (dbMock.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(dbMock.get).toHaveBeenCalledWith(
        'SELECT id, fullName, email, userType, createdAt FROM users WHERE id = ?',
        [userId],
      );
    });

    it('should return null if user does not exist', async () => {
      const userId = 999;
      (userService as any).db = dbMock;
      (dbMock.get as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById(userId);

      expect(result).toBeNull();
      expect(dbMock.get).toHaveBeenCalledWith(
        'SELECT id, fullName, email, userType, createdAt FROM users WHERE id = ?',
        [userId],
      );
    });

    it('should throw an error if database is not connected', async () => {
      const userId = 1;

      (userService as any).db = undefined;

      await expect(userService.getUserById(userId)).rejects.toThrow(
        new AppError(500, ApiErrorTypes.ServerError, 'Database is not connected with error undefined'),
      );
    });
  });
});
