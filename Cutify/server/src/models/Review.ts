import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  text: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (productId: mongoose.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

// Update product rating after save/remove
reviewSchema.post('save', async function () {
  const Review = this.constructor as any;
  await Review.calculateAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc: IReview) {
  if (doc) {
    const Review = mongoose.model('Review') as any;
    await Review.calculateAverageRating(doc.product);
  }
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
