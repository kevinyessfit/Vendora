import { Router } from 'express';
import { getMyEarnings, requestPayout, getAllPayouts, processPayoutRequest } from '../controllers/payout.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Vendor
router.get('/my-earnings', authenticate, requireRole('VENDOR'), getMyEarnings);
router.post('/request', authenticate, requireRole('VENDOR'), requestPayout);

// Admin
router.get('/all', authenticate, requireRole('ADMIN'), getAllPayouts);
router.patch('/:id/process', authenticate, requireRole('ADMIN'), processPayoutRequest);

export default router;
