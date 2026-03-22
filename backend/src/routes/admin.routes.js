import { Router } from 'express';
import {
    getAllUsers, deleteUser, getPlatformStats, getAllProducts, toggleProductStatus
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.patch('/products/:id/toggle', toggleProductStatus);

export default router;
