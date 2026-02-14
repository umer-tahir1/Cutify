import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: mongoose.Types.ObjectId;
  sku: string;
  stock: number;
  images: string[];
  hoverImage?: string;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isActive: boolean;
  tags: string[];
  attributes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function (this: IProduct, val: number) {
          return !val || val < this.price;
        },
        message: 'Sale price must be less than regular price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          return val.length > 0;
        },
        message: 'At least one product image is required',
      },
    },
    hoverImage: { type: String },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    attributes: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for optimized queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ stock: 1 });

// Virtual for checking if on sale
productSchema.virtual('isOnSale').get(function (this: IProduct) {
  return !!this.salePrice && this.salePrice < this.price;
});

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function (this: IProduct) {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Virtual for stock status
productSchema.virtual('inStock').get(function (this: IProduct) {
  return this.stock > 0;
});

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
