import { Router } from 'express';
import { cartController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, addToCartValidation, updateCartItemValidation } from '../middleware/validate';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartValidation), cartController.addToCart);
router.put('/items/:itemId', validate(updateCartItemValidation), cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

// Coupon
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
