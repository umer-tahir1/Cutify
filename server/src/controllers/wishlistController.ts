import { Response, NextFunction } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user!.id })
      .populate({
        path: 'products',
        select: 'name slug price salePrice images stock rating reviewCount isActive category',
        populate: { path: 'category', select: 'name slug' },
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user!.id, products: [] });
    }

    res.json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: req.user!.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user!.id, products: [] });
    }

    // Check if already in wishlist
    if (wishlist.products.some((p) => p.toString() === productId)) {
      throw new ApiError(409, 'Product already in wishlist');
    }

    wishlist.products.push(productId);
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug price salePrice images stock rating reviewCount isActive category',
      populate: { path: 'category', select: 'name slug' },
    });

    res.json({
      success: true,
      message: 'Added to wishlist',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id });
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    const index = wishlist.products.findIndex(
      (p) => p.toString() === req.params.productId
    );

    if (index === -1) {
      throw new ApiError(404, 'Product not in wishlist');
    }

    wishlist.products.splice(index, 1);
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug price salePrice images stock rating reviewCount isActive category',
      populate: { path: 'category', select: 'name slug' },
    });

    res.json({
      success: true,
      message: 'Removed from wishlist',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
export const checkWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id });
    const isInWishlist = wishlist
      ? wishlist.products.some((p) => p.toString() === req.params.productId)
      : false;

    res.json({
      success: true,
      data: { isInWishlist },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
export const clearWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }

    res.json({
      success: true,
      message: 'Wishlist cleared',
    });
  } catch (error) {
    next(error);
  }
};
