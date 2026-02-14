import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { getPagination, getPaginationInfo } from '../utils';

// @desc    Get all active categories (public)
// @route   GET /api/categories
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:idOrSlug
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const filter: any = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const category = await Category.findOne({ ...filter, isActive: true });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/categories/:idOrSlug/products
export const getCategoryProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const filter: any = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const category = await Category.findOne({ ...filter, isActive: true });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    const { page, limit, skip, order } = getPagination(req.query as any);
    const sortField = req.query.sort as string || 'createdAt';

    const [products, total] = await Promise.all([
      Product.find({ category: category._id, isActive: true })
        .sort({ [sortField]: order } as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ category: category._id, isActive: true }),
    ]);

    res.json({
      success: true,
      data: { category, products },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN OPERATIONS ====================

// @desc    Create category (admin)
// @route   POST /api/admin/categories
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, image, hoverImage, icon, sortOrder } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      throw new ApiError(409, 'Category with this name already exists');
    }

    const category = await Category.create({
      name,
      description,
      image: image || '',
      hoverImage: hoverImage || '',
      icon,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/admin/categories/:id
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/admin/categories/:id
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      throw new ApiError(400, `Cannot delete category with ${productCount} products. Move or delete products first.`);
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload category images (admin)
// @route   POST /api/admin/categories/:id/images
export const uploadCategoryImages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {};

    if (files.image && files.image[0]) {
      updateData.image = `/uploads/${files.image[0].filename}`;
    }
    if (files.hoverImage && files.hoverImage[0]) {
      updateData.hoverImage = `/uploads/${files.hoverImage[0].filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'No images uploaded');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Category images updated successfully',
      data: { category: updatedCategory },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories (admin - includes inactive)
// @route   GET /api/admin/categories
export const adminGetCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};
