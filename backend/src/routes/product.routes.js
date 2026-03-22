import { Router } from 'express';
import {
    getProducts, getMyProducts, createProduct, updateProduct, deleteProduct
} from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', authenticate, getProducts);
router.get('/mine', authenticate, requireRole('MERCHANT'), getMyProducts);
router.post('/', authenticate, requireRole('MERCHANT'), upload.single('image'), createProduct);
router.put('/:id', authenticate, requireRole('MERCHANT'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, requireRole('MERCHANT', 'ADMIN'), deleteProduct);

export default router;
