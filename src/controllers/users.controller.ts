import { Request, Response } from 'express';

import UserService from '../services/users.service';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
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
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const user = await this.userService.getUserById(Number(id));

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error: Error | any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;
