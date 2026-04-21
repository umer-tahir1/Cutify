import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  salePrice?: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  coupon?: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  total: number;
  updatedAt: Date;
  createdAt: Date;
  calculateTotals(): void;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [50, 'Cannot add more than 50 items'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Calculate totals method
cartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum: number, item: ICartItem) => {
    const effectivePrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
    return sum + effectivePrice * item.quantity;
  }, 0);
  this.total = Math.max(0, this.subtotal - this.discount);
};

// Auto-calculate before save
cartSchema.pre('save', function (next) {
  this.calculateTotals();
  next();
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
