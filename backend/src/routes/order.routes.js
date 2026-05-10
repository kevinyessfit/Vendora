import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createOrder, getMerchantOrders, getAllOrders, getVendorOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many orders from this IP, please try again later',
});

// Public route for customers to place orders
router.post('/', orderLimiter, createOrder);

// Protected tracking routes
router.get('/merchant', authenticate, requireRole('MERCHANT'), getMerchantOrders);
router.get('/vendor', authenticate, requireRole('VENDOR'), getVendorOrders);
router.get('/all', authenticate, requireRole('ADMIN'), getAllOrders);

// Order management
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
