import { Router } from 'express';
import { generateLink, getMyLinks, trackClick, getStats } from '../controllers/affiliate.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my-links', authenticate, requireRole('VENDOR'), getMyLinks);
router.post('/generate', authenticate, requireRole('VENDOR'), generateLink);
router.get('/stats', authenticate, requireRole('VENDOR'), getStats);
router.post('/track/:code', trackClick);

export default router;
