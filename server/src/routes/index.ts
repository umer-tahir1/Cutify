import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import orderRoutes from './orderRoutes';
import couponRoutes from './couponRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// API health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Cutify API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Public & User routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;
