import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { body, param, query } from 'express-validator';

// Run validation and return errors
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
    });
  };
};

// ==================== AUTH VALIDATIONS ====================
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('whatsappNumber')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,15}$/).withMessage('Invalid WhatsApp number format'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location must be under 100 characters'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
];

// ==================== PRODUCT VALIDATIONS ====================
export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('isBestSeller')
    .optional()
    .isBoolean().withMessage('isBestSeller must be boolean'),
];

export const updateProductValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// ==================== CATEGORY VALIDATIONS ====================
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const updateCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

// ==================== CART VALIDATIONS ====================
export const addToCartValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
];

export const updateCartItemValidation = [
  param('itemId').isMongoId().withMessage('Invalid item ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
];

// ==================== ORDER VALIDATIONS ====================
export const checkoutValidation = [
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cod', 'card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
  body('couponCode')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

export const updateOrderStatusValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters'),
];

// ==================== COUPON VALIDATIONS ====================
export const createCouponValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Code must be 3-20 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
  body('value')
    .notEmpty().withMessage('Value is required')
    .isFloat({ min: 0 }).withMessage('Value must be positive'),
  body('expiresAt')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Invalid date format'),
];

// ==================== ADDRESS VALIDATIONS ====================
export const addressValidation = [
  body('label')
    .trim()
    .notEmpty().withMessage('Address label is required'),
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required'),
  body('street')
    .trim()
    .notEmpty().withMessage('Street is required'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required'),
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),
];

// ==================== REVIEW VALIDATIONS ====================
export const createReviewValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('text')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters'),
];

// ==================== GENERIC VALIDATIONS ====================
export const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

export const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
