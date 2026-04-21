import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { getPagination, getPaginationInfo } from '../utils';

// @desc    Validate coupon code (public/user)
// @route   POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code');
    }

    if (!coupon.isValid()) {
      throw new ApiError(400, 'This coupon has expired or is no longer valid');
    }

    const discount = coupon.calculateDiscount(cartTotal || 0);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN COUPON OPERATIONS ====================

// @desc    Get all coupons (admin)
// @route   GET /api/admin/coupons
export const getCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query as any);

    const [coupons, total] = await Promise.all([
      Coupon.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { coupons },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon (admin)
// @route   GET /api/admin/coupons/:id
export const getCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }

    res.json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/admin/coupons
export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      code, description, type, value,
      minOrderAmount, maxDiscount, usageLimit,
      perUserLimit, applicableProducts, applicableCategories,
      startsAt, expiresAt,
    } = req.body;

    // Validate percentage value
    if (type === 'percentage' && value > 100) {
      throw new ApiError(400, 'Percentage discount cannot exceed 100%');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 1,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      startsAt: startsAt || new Date(),
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/admin/coupons/:id
export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
