import { Router } from 'express';
import { reviewController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, createReviewValidation } from '../middleware/validate';

const router = Router();

// Public
router.get('/product/:productId', reviewController.getProductReviews);

// Protected
router.post('/', authenticate, validate(createReviewValidation), reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;
