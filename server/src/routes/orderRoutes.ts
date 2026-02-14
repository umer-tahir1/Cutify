import { Router } from 'express';
import { orderController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, checkoutValidation } from '../middleware/validate';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post('/checkout', validate(checkoutValidation), orderController.checkout);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.get('/:id/track', orderController.trackOrder);

export default router;
