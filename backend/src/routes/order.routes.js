import { Router } from 'express';
import { createOrder, getMerchantOrders, getAllOrders, getVendorOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public route for customers to place orders
router.post('/', createOrder);

// Protected tracking routes
router.get('/merchant', authenticate, requireRole('MERCHANT'), getMerchantOrders);
router.get('/vendor', authenticate, requireRole('VENDOR'), getVendorOrders);
router.get('/all', authenticate, requireRole('ADMIN'), getAllOrders);

// Order management
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
