import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProductValidation,
  updateProductValidation,
  createCategoryValidation,
  updateCategoryValidation,
  createCouponValidation,
  updateOrderStatusValidation,
} from '../middleware/validate';
import { uploadMultiple, uploadCategoryImages } from '../middleware/upload';
import { productController } from '../controllers';
import { categoryController } from '../controllers';
import { orderController } from '../controllers';
import { couponController } from '../controllers';
import { adminController } from '../controllers';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard', adminController.getDashboardStats);

// ==================== PRODUCTS ====================
router.get('/products', productController.adminGetProducts);
router.post('/products', validate(createProductValidation), productController.createProduct);
router.put('/products/:id', validate(updateProductValidation), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.post('/products/:id/images', uploadMultiple, productController.uploadProductImages);

// ==================== CATEGORIES ====================
router.get('/categories', categoryController.adminGetCategories);
router.post('/categories', validate(createCategoryValidation), categoryController.createCategory);
router.put('/categories/:id', validate(updateCategoryValidation), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);
router.post('/categories/:id/images', uploadCategoryImages as any, categoryController.uploadCategoryImages);

// ==================== ORDERS ====================
router.get('/orders', orderController.adminGetOrders);
router.get('/orders/:id', orderController.adminGetOrder);
router.put('/orders/:id/status', validate(updateOrderStatusValidation), orderController.updateOrderStatus);

// ==================== COUPONS ====================
router.get('/coupons', couponController.getCoupons);
router.get('/coupons/:id', couponController.getCoupon);
router.post('/coupons', validate(createCouponValidation), couponController.createCoupon);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

// ==================== USERS ====================
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);

// ==================== INVENTORY ====================
router.get('/inventory', adminController.getInventoryReport);

export default router;
