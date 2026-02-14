import { Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { AuthRequest } from '../types';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      monthlyOrders,
      lastMonthOrders,
      revenueResult,
      monthlyRevenueResult,
      lastMonthRevenueResult,
      totalUsers,
      monthlyUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      lowStockProducts,
      ordersByStatus,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$items.salePrice', '$items.price'] }] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    // Revenue trend (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          monthlyOrders,
          lastMonthOrders,
          ordersGrowth: lastMonthOrders > 0 ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 0,
          totalRevenue,
          monthlyRevenue,
          lastMonthRevenue,
          revenueGrowth: lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0,
          totalUsers,
          monthlyUsers,
          totalProducts,
          activeProducts,
          totalCategories,
          lowStockProducts,
        },
        ordersByStatus: ordersByStatus.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentOrders,
        topProducts,
        dailyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { users },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (admin)
// @route   PUT /api/admin/users/:id/status
export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report (admin)
// @route   GET /api/admin/inventory
export const getInventoryReport = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      outOfStock,
      lowStock,
      allProducts,
      categoryStock,
    ] = await Promise.all([
      Product.find({ stock: 0, isActive: true })
        .select('name sku stock category')
        .populate('category', 'name')
        .lean(),
      Product.find({ stock: { $gt: 0, $lte: 10 }, isActive: true })
        .select('name sku stock category')
        .populate('category', 'name')
        .sort({ stock: 1 })
        .lean(),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            totalProducts: { $sum: 1 },
            avgStock: { $avg: '$stock' },
          },
        },
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$stock' },
            productCount: { $sum: 1 },
            outOfStockCount: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            categoryName: '$category.name',
            totalStock: 1,
            productCount: 1,
            outOfStockCount: 1,
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        summary: allProducts[0] || { totalStock: 0, totalProducts: 0, avgStock: 0 },
        outOfStock,
        lowStock,
        categoryStock,
      },
    });
  } catch (error) {
    next(error);
  }
};
