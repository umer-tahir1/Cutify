import { Router } from 'express';
import { productController } from '../controllers';

const router = Router();

// Public product routes
router.get('/', productController.getProducts);
router.get('/featured/best-sellers', productController.getBestSellers);
router.get('/:idOrSlug', productController.getProduct);

export default router;
