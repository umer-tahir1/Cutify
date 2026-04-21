import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, addressValidation } from '../middleware/validate';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Addresses
router.get('/addresses', userController.getAddresses);
router.post('/addresses', validate(addressValidation), userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

export default router;
