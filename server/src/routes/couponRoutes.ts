import { Router } from 'express';
import { couponController } from '../controllers';

const router = Router();

// Public coupon validation
router.post('/validate', couponController.validateCoupon);

export default router;
