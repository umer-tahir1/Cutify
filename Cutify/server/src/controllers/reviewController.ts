import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { getPagination, getPaginationInfo } from '../utils';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query as any);

    const filter: any = { product: req.params.productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { reviews },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, rating, title, text } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ user: req.user!.id, product: productId });
    if (existing) {
      throw new ApiError(409, 'You have already reviewed this product');
    }

    // Check if user purchased this product (verified purchase)
    const hasPurchased = await Order.exists({
      user: req.user!.id,
      'items.product': productId,
      status: 'delivered',
    });

    const review = await Review.create({
      user: req.user!.id,
      product: productId,
      rating,
      title,
      text,
      isVerifiedPurchase: !!hasPurchased,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user!.id });
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    const { rating, title, text } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (text !== undefined) review.text = text;

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Review updated',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user!.id });
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    await Review.findOneAndDelete({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};
