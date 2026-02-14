import { Request } from 'express';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query params
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductQuery extends PaginationQuery {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  isBestSeller?: string;
}

export interface OrderQuery extends PaginationQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Cart types
export interface CartItemInput {
  productId: string;
  quantity: number;
}

// Checkout types
export interface CheckoutInput {
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

// Address type
export interface AddressInput {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}
