import { Router } from 'express';

import { UserController } from '../controllers/users.controller';
import { UserService } from '../services/users.service';

const userService = new UserService();
const userController = new UserController(userService);
const userRoutes = Router();

userRoutes.post('', userController.createUser);
userRoutes.get('/:id', userController.getUserById);

export default userRoutes;
