import { Request, Response } from 'express';

import UserService from '../services/users.service';
import userValidationSchema from '../database/userSchema';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { error } = userValidationSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          errors: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
          })),
        });
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

      return res.status(201).json(newUser);
    } catch (error: Error | any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id))) {
        throw new Error('Invalid is provided it must be a number');
      }

      const user = await this.userService.getUserById(Number(id));

      if (!user) {
        throw new Error(`User not found with id=${id}`);
      }

      return res.status(200).json(user);
    } catch (error: Error | any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;
