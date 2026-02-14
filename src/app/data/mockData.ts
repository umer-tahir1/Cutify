// Types matching the backend API responses

export interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string } | string;
  description: string;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  stock: number;
  sku: string;
  slug: string;
  tags: string[];
  isActive: boolean;
  // Convenience getters for backward compatibility
  id?: string;
  image?: string;
  hoverImage?: string;
  inStock?: boolean;
  reviews?: number;
  colors?: { name: string; hex: string }[];
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  hoverImage: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  id?: string;
}

export interface Review {
  _id: string;
  user: { name: string };
  product: string;
  rating: number;
  title: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
  // backward compat
  id?: string;
  author?: string;
  date?: string;
}

// Helper to normalize a product from API response
export function normalizeProduct(p: any): Product {
  return {
    ...p,
    id: p._id,
    image: p.images?.[0] || '',
    hoverImage: p.images?.[1] || p.images?.[0] || '',
    inStock: (p.stock ?? 0) > 0,
    reviews: p.reviewCount,
    colors: [],
  };
}

// Helper to normalize a category from API response
export function normalizeCategory(c: any): Category {
  return {
    ...c,
    id: c._id,
  };
}

// These are kept empty — data now comes from the API
export const categories: Category[] = [];
export const products: Product[] = [];
export const reviews: Review[] = [];

export const bannerImages = [
  'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=600&fit=crop',
];
