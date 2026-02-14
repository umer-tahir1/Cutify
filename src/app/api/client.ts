// Cutify API Client
// Uses static JSON data on production (GitHub Pages), or live API in dev mode.

// In production builds (GitHub Pages), use static JSON data.
// In dev mode, use live API with backend proxy.
const isStaticDeploy = !import.meta.env.DEV;

// Re-export from static client for static deployments
import { api as staticApi } from './static-client';

const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('cutify-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Auth
  async register(name: string, email: string, password: string, whatsappNumber?: string, location?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password, ...(whatsappNumber && { whatsappNumber }), ...(location && { location }) },
    });
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', { method: 'POST', body: { email, password } });
    if (data.data?.accessToken) {
      localStorage.setItem('cutify-token', data.data.accessToken);
      localStorage.setItem('cutify-refresh-token', data.data.refreshToken);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('cutify-token');
      localStorage.removeItem('cutify-refresh-token');
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', { method: 'POST', body: { email } });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', { method: 'POST', body: { token, password } });
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/products${query}`);
  }

  async getProduct(idOrSlug: string) {
    return this.request(`/products/${idOrSlug}`);
  }

  async getBestSellers() {
    return this.request('/products/featured/best-sellers');
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(idOrSlug: string) {
    return this.request(`/categories/${idOrSlug}`);
  }

  async getCategoryProducts(idOrSlug: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/categories/${idOrSlug}/products${query}`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.request('/cart/items', { method: 'POST', body: { productId, quantity } });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity } });
  }

  async removeFromCart(itemId: string) {
    return this.request(`/cart/items/${itemId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request('/cart', { method: 'DELETE' });
  }

  async applyCoupon(code: string) {
    return this.request('/cart/coupon', { method: 'POST', body: { code } });
  }

  async removeCoupon() {
    return this.request('/cart/coupon', { method: 'DELETE' });
  }

  // Wishlist
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request('/wishlist', { method: 'POST', body: { productId } });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/wishlist/${productId}`, { method: 'DELETE' });
  }

  async checkWishlist(productId: string) {
    return this.request(`/wishlist/check/${productId}`);
  }

  // Orders
  async checkout(data: {
    shippingAddress: any;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
  }) {
    return this.request('/orders/checkout', { method: 'POST', body: data });
  }

  async getOrders(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/orders${query}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, { method: 'PUT', body: { reason } });
  }

  async trackOrder(id: string) {
    return this.request(`/orders/${id}/track`);
  }

  // User Profile
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: { name?: string; phone?: string }) {
    return this.request('/users/profile', { method: 'PUT', body: data });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/change-password', { method: 'PUT', body: { currentPassword, newPassword } });
  }

  async getAddresses() {
    return this.request('/users/addresses');
  }

  async addAddress(address: any) {
    return this.request('/users/addresses', { method: 'POST', body: address });
  }

  async updateAddress(addressId: string, address: any) {
    return this.request(`/users/addresses/${addressId}`, { method: 'PUT', body: address });
  }

  async deleteAddress(addressId: string) {
    return this.request(`/users/addresses/${addressId}`, { method: 'DELETE' });
  }

  // Reviews
  async getProductReviews(productId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/reviews/product/${productId}${query}`);
  }

  async createReview(data: { productId: string; rating: number; title?: string; text: string }) {
    return this.request('/reviews', { method: 'POST', body: data });
  }

  // Coupons
  async validateCoupon(code: string, cartTotal: number) {
    return this.request('/coupons/validate', { method: 'POST', body: { code, cartTotal } });
  }

  // ==================== ADMIN APIs ====================

  // Dashboard
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  // Admin Products
  async getAdminProducts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/products${query}`);
  }

  async createProduct(data: any) {
    return this.request('/admin/products', { method: 'POST', body: data });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/admin/products/${id}`, { method: 'PUT', body: data });
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, { method: 'DELETE' });
  }

  async uploadProductImages(id: string, formData: FormData) {
    const token = localStorage.getItem('cutify-token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${this.baseUrl}/admin/products/${id}/images`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  }

  // Admin Categories
  async getAdminCategories(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/categories${query}`);
  }

  async createCategory(data: any) {
    return this.request('/admin/categories', { method: 'POST', body: data });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/admin/categories/${id}`, { method: 'PUT', body: data });
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/categories/${id}`, { method: 'DELETE' });
  }

  // Admin Orders
  async getAdminOrders(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/orders${query}`);
  }

  async getAdminOrder(id: string) {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } });
  }

  // Admin Coupons
  async getAdminCoupons(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/coupons${query}`);
  }

  async getAdminCoupon(id: string) {
    return this.request(`/admin/coupons/${id}`);
  }

  async createCoupon(data: any) {
    return this.request('/admin/coupons', { method: 'POST', body: data });
  }

  async updateCoupon(id: string, data: any) {
    return this.request(`/admin/coupons/${id}`, { method: 'PUT', body: data });
  }

  async deleteCoupon(id: string) {
    return this.request(`/admin/coupons/${id}`, { method: 'DELETE' });
  }

  // Admin Users
  async getAdminUsers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/users${query}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } });
  }

  async toggleUserStatus(id: string) {
    return this.request(`/admin/users/${id}/status`, { method: 'PUT' });
  }

  // Admin Inventory
  async getAdminInventory() {
    return this.request('/admin/inventory');
  }
}

// Use static client for GitHub Pages (no backend), otherwise use live API client
const liveApi = new ApiClient(API_BASE);
export const api = isStaticDeploy ? staticApi : liveApi;
export default api;
