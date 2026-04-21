import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  usedBy: mongoose.Types.ObjectId[];
  applicableProducts: mongoose.Types.ObjectId[];
  applicableCategories: mongoose.Types.ObjectId[];
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  calculateDiscount(cartTotal: number): number;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Code must be at least 3 characters'],
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    isActive: { type: Boolean, default: true },
    startsAt: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ isActive: 1, expiresAt: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function (): boolean {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startsAt) return false;
  if (now > this.expiresAt) return false;
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return false;
  return true;
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (cartTotal: number): number {
  if (!this.isValid()) return 0;
  if (cartTotal < this.minOrderAmount) return 0;

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (cartTotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.value, cartTotal);
  }

  return Math.round(discount * 100) / 100;
};

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
