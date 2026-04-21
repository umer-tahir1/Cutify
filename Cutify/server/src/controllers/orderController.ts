import { Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { User } from '../models/User';
import { AuthRequest, OrderQuery } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { getPagination, getPaginationInfo, sanitizeSortField } from '../utils';
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendAdminNewOrderEmail,
} from '../utils/email';

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const TAX_RATE = 0; // Set to 0.18 for 18% GST if needed

// @desc    Create order (checkout)
// @route   POST /api/orders/checkout
export const checkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user!.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Validate all items in stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        throw new ApiError(400, `Product "${(item.product as any).name || 'Unknown'}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }

      const effectivePrice = product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        quantity: item.quantity,
        image: product.images[0] || '',
      });

      subtotal += effectivePrice * item.quantity;
    }

    // Calculate discount
    let discount = 0;
    let couponId = undefined;
    let appliedCouponCode = undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = coupon.calculateDiscount(subtotal);
        couponId = coupon._id;
        appliedCouponCode = coupon.code;
      }
    } else if (cart.coupon && cart.discount > 0) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon && coupon.isValid()) {
        discount = coupon.calculateDiscount(subtotal);
        couponId = coupon._id;
        appliedCouponCode = coupon.code;
      }
    }

    // Calculate shipping
    const afterDiscount = subtotal - discount;
    const shippingCost = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Calculate tax
    const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;

    // Total
    const total = Math.round((afterDiscount + shippingCost + tax) * 100) / 100;

    // Create order
    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      coupon: couponId,
      couponCode: appliedCouponCode,
      notes,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    // Reduce stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Update coupon usage
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user!.id },
      });
    }

    // Clear cart
    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    // Send order confirmation email (non-blocking)
    const user = await User.findById(req.user!.id);
    if (user) {
      sendOrderConfirmation(user.email, user.name, {
        orderNumber: order.orderNumber,
        items: orderItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: (item.salePrice && item.salePrice < item.price ? item.salePrice : item.price) * item.quantity,
        })),
        subtotal,
        discount,
        shippingCost,
        total,
        shippingAddress,
      }).catch(console.error);

      // Notify admins (non-blocking)
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('email');
      for (const admin of admins) {
        sendAdminNewOrderEmail(admin.email, {
          orderNumber: order.orderNumber,
          total,
          itemCount: orderItems.length,
          customerName: user.name,
          customerEmail: user.email,
        }).catch(console.error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query as any);

    const filter: any = { user: req.user!.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { orders },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    }).populate('items.product', 'name slug images');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new ApiError(400, 'Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: order.cancelReason,
    });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // Restore coupon usage
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: -1 },
        $pull: { usedBy: req.user!.id },
      });
    }

    // Send cancellation email
    const user = await User.findById(req.user!.id);
    if (user) {
      sendOrderStatusUpdate(user.email, user.name, order.orderNumber, 'cancelled').catch(console.error);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order
// @route   GET /api/orders/:id/track
export const trackOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    }).select('orderNumber status statusHistory trackingNumber estimatedDelivery');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        statusHistory: order.statusHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN ORDER OPERATIONS ====================

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
export const adminGetOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as OrderQuery;
    const { page, limit, skip, order } = getPagination(query);
    const sortField = sanitizeSortField(query.sort || 'createdAt');

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ [sortField]: order } as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { orders },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order (admin)
// @route   GET /api/admin/orders/:id
export const adminGetOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images sku');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // Update payment status for delivered orders
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    // Handle cancellation
    if (status === 'cancelled') {
      order.cancelReason = note || 'Cancelled by admin';
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
      // Restore coupon
      if (order.coupon) {
        await Coupon.findByIdAndUpdate(order.coupon, {
          $inc: { usedCount: -1 },
          $pull: { usedBy: order.user },
        });
      }
    }

    await order.save();

    // Send status update email
    const user = await User.findById(order.user);
    if (user) {
      sendOrderStatusUpdate(user.email, user.name, order.orderNumber, status, note).catch(console.error);
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
