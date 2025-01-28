import { Request, Response, NextFunction } from 'express';

import UserService from '../../../src/services/users.service';
import AppError from '../../../src/errors/error';
import ApiErrorTypes from '../../../src/types/error';
import UserController from '../../../src/controllers/users.controller';
import { UserType } from '../../../src/types/user';
import userValidationSchema from '../../../src/database/userSchema';

jest.mock('../../../src/services/users.service');

describe('UserController', () => {
  let userServiceMock: jest.Mocked<UserService>;
  let userController: UserController;

  beforeEach(() => {
    userServiceMock = new UserService() as jest.Mocked<UserService>;
    userController = new UserController(userServiceMock);
  });

  describe('createUser', () => {
    it('should call userService.createUser with valid data and return the created user', async () => {
      const req = {
        body: {
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
          userType: UserType.privateTutor,
          createdAt: '2025-01-01 00:00:00',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      userServiceMock.createUser.mockResolvedValue({ id: 1, ...req.body });

      await userController.createUser(req, res, next);

      expect(userServiceMock.createUser).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      const req = {
        body: {
          email: 'john@example.com',
          password: 'Password123',
          userType: UserType.student,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      let validationError = null;
      const { error } = userValidationSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        validationError = new AppError(400, ApiErrorTypes.ValidationError, error.message || 'Some fields are missing or incompatible type', error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })));
      }

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
    });

    it('should handle existing email error correctly', async () => {
      const req = {
        body: {
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
          userType: 'student',
          createdAt: '2025-01-01 00:00:00',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const emailExistsError = new AppError(400, ApiErrorTypes.ValidationError, 'User with the provided email already exists', []);

      userServiceMock.createUser.mockRejectedValue(emailExistsError);

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(emailExistsError);
    });
  });

  describe('getUserById', () => {
    it('should return user data when user exists', async () => {
      const req = {
        params: { id: '1' },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const mockUser = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        userType: UserType.student,
        createdAt: '2025-01-01 00:00:00',
      };

      userServiceMock.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res, next);

      expect(userServiceMock.getUserById).toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if user is not found', async () => {
      const req = {
        params: { id: '9999' },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      userServiceMock.getUserById.mockResolvedValue(null);

      await userController.getUserById(req, res, next);

      const notFoundError = new AppError(404, ApiErrorTypes.NotFoundError, `User not found with id=${req.params.id}`);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(notFoundError);
    });

    it('should return 400 for invalid user id format', async () => {
      const req = {
        params: { id: 'abc' },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const idError = new AppError(400, ApiErrorTypes.ValidationError, `Invalid ID provided; it must be a number provided id = ${req.params.id}`);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(idError);
    });
  });
});
