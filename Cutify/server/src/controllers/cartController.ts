import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';

// @desc    Get user's cart
// @route   GET /api/cart
export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user!.id })
      .populate({
        path: 'items.product',
        select: 'name slug price salePrice images stock isActive',
      })
      .populate('coupon', 'code type value');

    if (!cart) {
      cart = await Cart.create({ user: req.user!.id, items: [] });
    }

    res.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity } = req.body;

    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found or unavailable');
    }

    if (product.stock < quantity) {
      throw new ApiError(400, `Only ${product.stock} items available in stock`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      cart = new Cart({ user: req.user!.id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new ApiError(400, `Only ${product.stock} items available in stock`);
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].salePrice = product.salePrice;
    } else {
      cart.items.push({
        product: product._id as any,
        quantity,
        price: product.price,
        salePrice: product.salePrice,
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate({
      path: 'items.product',
      select: 'name slug price salePrice images stock isActive',
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const item = (cart.items as any).id(req.params.itemId);
    if (!item) {
      throw new ApiError(404, 'Item not found in cart');
    }

    // Verify stock
    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) {
      throw new ApiError(400, `Only ${product?.stock || 0} items available in stock`);
    }

    item.quantity = quantity;
    item.price = product.price;
    item.salePrice = product.salePrice;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price salePrice images stock isActive',
    });

    res.json({
      success: true,
      message: 'Cart updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => (item as any)._id?.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price salePrice images stock isActive',
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (cart) {
      cart.items = [];
      cart.coupon = undefined;
      cart.discount = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
export const applyCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code');
    }

    if (!coupon.isValid()) {
      throw new ApiError(400, 'This coupon has expired or is no longer valid');
    }

    // Check per-user limit
    const userUsageCount = coupon.usedBy.filter(
      (userId) => userId.toString() === req.user!.id
    ).length;
    if (userUsageCount >= coupon.perUserLimit) {
      throw new ApiError(400, 'You have already used this coupon');
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cart.subtotal);
    if (discount === 0) {
      throw new ApiError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required`);
    }

    cart.coupon = coupon._id as any;
    cart.discount = discount;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price salePrice images stock isActive',
    });

    res.json({
      success: true,
      message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
      data: { cart, discount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
export const removeCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (cart) {
      cart.coupon = undefined;
      cart.discount = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Coupon removed',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
