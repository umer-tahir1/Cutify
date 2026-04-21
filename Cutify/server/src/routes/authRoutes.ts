import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middleware/validate';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
