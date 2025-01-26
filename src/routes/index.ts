import { Router } from 'express';

import userRoutes from './users';
import errorHandler from '../middleware/errorHandler';

const router = Router();

router.use('/users', userRoutes);

router.use(errorHandler);
export default router;
