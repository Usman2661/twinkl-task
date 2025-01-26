import { NextFunction, Request, Response } from 'express';

import UserService from '../services/users.service';
import userValidationSchema from '../database/userSchema';
import AppError from '../errors/error';
import ApiErrorTypes from '../types/error';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = userValidationSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new AppError(400, ApiErrorTypes.ValidationError, error.message || 'Some fields are missing or incompatible type', error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })));
      }

      const {
        fullName, email, password, userType, createdAt,
      } = req.body;

      const newUser = await this.userService.createUser({
        fullName,
        email,
        password,
        userType,
        createdAt,
      });

      res.status(201).json(newUser);
    } catch (error: Error | any) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id))) {
        throw new AppError(400, ApiErrorTypes.ValidationError, `Invalid ID provided; it must be a number provided id = ${id}`);
      }

      const user = await this.userService.getUserById(Number(id));

      if (!user) {
        throw new AppError(404, ApiErrorTypes.NotFoundError, `User not found with id=${id}`);
      }

      res.status(200).json(user);
    } catch (error: Error | any) {
      next(error);
    }
  }
}

export default UserController;
