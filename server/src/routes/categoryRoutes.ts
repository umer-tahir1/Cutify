import { Router } from 'express';
import { categoryController } from '../controllers';

const router = Router();

// Public category routes
router.get('/', categoryController.getCategories);
router.get('/:idOrSlug', categoryController.getCategory);
router.get('/:idOrSlug/products', categoryController.getCategoryProducts);

export default router;
