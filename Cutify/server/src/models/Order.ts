import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  coupon?: mongoose.Types.ObjectId;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  statusHistory: IStatusHistory[];
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (val: IOrderItem[]) {
          return val.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    notes: { type: String, maxlength: 500 },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    statusHistory: [statusHistorySchema],
    cancelReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before validation
orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'CUT';
    const timestamp = date.getFullYear().toString().slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `${prefix}-${timestamp}-${random}`;
  }

  // Initialize status history
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [
      { status: this.status, timestamp: new Date(), note: 'Order created' },
    ];
  }

  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
