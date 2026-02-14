import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { AuthRequest, ProductQuery } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { getPagination, getPaginationInfo, sanitizeSortField } from '../utils';

// @desc    Get all products (public, with filters)
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as ProductQuery;
    const { page, limit, skip, order } = getPagination(query);
    const sortField = sanitizeSortField(query.sort || 'createdAt');

    // Build filter
    const filter: any = { isActive: true };

    if (query.category) {
      // Support category slug or ID
      const category = await Category.findOne({
        $or: [
          { slug: query.category },
          ...(query.category.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: query.category }] : []),
        ],
      });
      if (category) {
        filter.category = category._id;
      }
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }

    if (query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    if (query.isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ [sortField]: order } as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { products },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const filter: any = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const product = await Product.findOne({ ...filter, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best sellers
// @route   GET /api/products/featured/best-sellers
export const getBestSellers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find({ isBestSeller: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ rating: -1 })
      .limit(12)
      .lean();

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN OPERATIONS ====================

// @desc    Create product (admin)
// @route   POST /api/admin/products
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name, description, price, salePrice, category,
      sku, stock, images, hoverImage, tags, isBestSeller, attributes,
    } = req.body;

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw new ApiError(400, 'Invalid category');
    }

    const product = await Product.create({
      name,
      description,
      price,
      salePrice,
      category,
      sku,
      stock,
      images: images || [],
      hoverImage,
      tags: tags || [],
      isBestSeller: isBestSeller || false,
      attributes: attributes || {},
    });

    // Update category product count
    await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // If category changes, update counts
    if (req.body.category && req.body.category !== product.category.toString()) {
      const newCategory = await Category.findById(req.body.category);
      if (!newCategory) {
        throw new ApiError(400, 'Invalid category');
      }
      await Promise.all([
        Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } }),
        Category.findByIdAndUpdate(req.body.category, { $inc: { productCount: 1 } }),
      ]);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Decrement category product count
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product images (admin)
// @route   POST /api/admin/products/:id/images
export const uploadProductImages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new ApiError(400, 'No images uploaded');
    }

    const imageUrls = files.map((file) => `/uploads/${file.filename}`);
    product.images.push(...imageUrls);
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images: product.images },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (admin - includes inactive)
// @route   GET /api/admin/products
export const adminGetProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as ProductQuery;
    const { page, limit, skip, order } = getPagination(query);
    const sortField = sanitizeSortField(query.sort || 'createdAt');

    const filter: any = {};

    if (query.category) {
      filter.category = query.category;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { sku: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    } else if (query.inStock === 'false') {
      filter.stock = 0;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ [sortField]: order } as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { products },
      pagination: getPaginationInfo(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};
