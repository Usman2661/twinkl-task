import { Router } from 'express';

import UserService from '../services/users.service';
import UserController from '../controllers/users.controller';

const userService = new UserService();
const userController = new UserController(userService);

const userRoutes = Router();

userRoutes.post('', userController.createUser.bind(userController));
userRoutes.get('/:id', userController.getUserById.bind(userController));

export default userRoutes;
