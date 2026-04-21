import { Router } from 'express';
import { wishlistController } from '../controllers';
import { authenticate } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
