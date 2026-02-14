// Cutify Static API Client
// Serves data from pre-generated JSON files for GitHub Pages deployment.
// Write operations (auth, cart, orders) are handled locally via localStorage.

const BASE_URL = import.meta.env.BASE_URL || '/';

// Resolve asset URLs to include the base path
function resolveUrl(url: string): string {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  if (BASE_URL !== '/' && url.startsWith('/') && !url.startsWith(BASE_URL)) {
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}${url}`;
  }
  return url;
}

// Recursively resolve all image URLs in an object
function resolveImageUrls(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(resolveImageUrls);
  const result: any = { ...obj };
  for (const key of Object.keys(result)) {
    if ((key === 'image' || key === 'hoverImage') && typeof result[key] === 'string') {
      result[key] = resolveUrl(result[key]);
    } else if (key === 'images' && Array.isArray(result[key])) {
      result[key] = result[key].map((url: string) => resolveUrl(url));
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = resolveImageUrls(result[key]);
    }
  }
  return result;
}

// Cache fetched JSON to avoid repeated network requests
const _cache: Record<string, any> = {};

async function fetchJSON(filePath: string) {
  const url = `${BASE_URL}api/${filePath}`.replace(/\/\//g, '/');
  if (_cache[url]) return _cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  // Resolve all image URLs in the response
  const resolved = resolveImageUrls(data);
  _cache[url] = resolved;
  return resolved;
}

// ── All data loaders ──
let _allProducts: any[] | null = null;
let _allCategories: any[] | null = null;
let _allReviews: any[] | null = null;

async function loadProducts() {
  if (_allProducts) return _allProducts;
  const res = await fetchJSON('products.json');
  _allProducts = res.data?.products || [];
  return _allProducts;
}

async function loadCategories() {
  if (_allCategories) return _allCategories;
  const res = await fetchJSON('categories.json');
  _allCategories = res.data?.categories || [];
  return _allCategories;
}

async function loadReviews() {
  if (_allReviews) return _allReviews;
  const res = await fetchJSON('reviews.json');
  _allReviews = res.data?.reviews || [];
  return _allReviews;
}

// ═════════════════════════════════════════
// Static API Client (mirrors the real ApiClient interface)
// ═════════════════════════════════════════
class StaticApiClient {

  // ── Auth (all local/no-op for static site) ──
  async register(_name: string, _email: string, _password: string) {
    return { success: false, error: 'Registration is not available in demo mode.' };
  }

  async login(_email: string, _password: string) {
    return { success: false, error: 'Login is not available in demo mode.' };
  }

  async logout() {
    localStorage.removeItem('cutify-token');
    localStorage.removeItem('cutify-refresh-token');
  }

  async getMe() {
    return { data: null };
  }

  async forgotPassword(_email: string) {
    return { success: false, error: 'Not available in demo mode.' };
  }

  async resetPassword(_token: string, _password: string) {
    return { success: false, error: 'Not available in demo mode.' };
  }

  // ── Products ──
  async getProducts(params?: Record<string, string>) {
    const products = await loadProducts();
    let result = [...products!];

    // Filter by category
    if (params?.category) {
      result = result.filter((p: any) => {
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        return catId === params.category;
      });
    }

    // Sort
    if (params?.sort) {
      const sortField = params.sort.replace(/^-/, '');
      const desc = params.sort.startsWith('-');
      result.sort((a: any, b: any) => {
        const av = a[sortField] ?? 0;
        const bv = b[sortField] ?? 0;
        return desc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
      });
    }

    // Limit
    if (params?.limit) {
      result = result.slice(0, parseInt(params.limit));
    }

    return { data: { products: result, total: result.length } };
  }

  async getProduct(idOrSlug: string) {
    const products = await loadProducts();
    const product = products!.find(
      (p: any) => p._id === idOrSlug || p.slug === idOrSlug
    );
    return { data: { product: product || null } };
  }

  async getBestSellers() {
    try {
      const res = await fetchJSON('best-sellers.json');
      return res;
    } catch {
      const products = await loadProducts();
      const bestSellers = products!.filter((p: any) => p.isBestSeller);
      return { data: { products: bestSellers } };
    }
  }

  // ── Categories ──
  async getCategories() {
    const categories = await loadCategories();
    return { data: { categories } };
  }

  async getCategory(idOrSlug: string) {
    const categories = await loadCategories();
    const cat = categories!.find(
      (c: any) => c._id === idOrSlug || c.slug === idOrSlug
    );
    return { data: { category: cat || null } };
  }

  async getCategoryProducts(idOrSlug: string, _params?: Record<string, string>) {
    // Try fetching the pre-built JSON first
    try {
      const res = await fetchJSON(`category/${encodeURIComponent(idOrSlug)}.json`);
      return res;
    } catch {
      // Fallback: filter from full product list
      const categories = await loadCategories();
      const cat = categories!.find(
        (c: any) => c._id === idOrSlug || c.slug === idOrSlug
      );
      if (!cat) throw new Error('Category not found');
      const products = await loadProducts();
      const catProducts = products!.filter((p: any) => {
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        return catId === cat._id;
      });
      return { data: { category: cat, products: catProducts } };
    }
  }

  // ── Cart (localStorage only) ──
  async getCart() {
    return { data: { items: [] } };
  }

  async addToCart(_productId: string, _quantity: number = 1) {
    return { data: { items: [] } };
  }

  async updateCartItem(_itemId: string, _quantity: number) {
    return { data: { items: [] } };
  }

  async removeFromCart(_itemId: string) {
    return { data: { items: [] } };
  }

  async clearCart() {
    return { data: { items: [] } };
  }

  async applyCoupon(_code: string) {
    return { data: null };
  }

  async removeCoupon() {
    return { data: null };
  }

  // ── Wishlist (localStorage only) ──
  async getWishlist() {
    return { data: { items: [] } };
  }

  async addToWishlist(_productId: string) {
    return { data: { items: [] } };
  }

  async removeFromWishlist(_productId: string) {
    return { data: null };
  }

  async checkWishlist(_productId: string) {
    return { data: { inWishlist: false } };
  }

  // ── Orders (no-op for static) ──
  async checkout(_data: any) {
    return { success: false, error: 'Checkout is not available in demo mode. Please contact us on WhatsApp!' };
  }

  async getOrders(_params?: Record<string, string>) {
    return { data: { orders: [] } };
  }

  async getOrder(_id: string) {
    return { data: { order: null } };
  }

  async cancelOrder(_id: string, _reason?: string) {
    return { data: null };
  }

  async trackOrder(_id: string) {
    return { data: null };
  }

  // ── User Profile (no-op) ──
  async getProfile() {
    return { data: null };
  }

  async updateProfile(_data: any) {
    return { data: null };
  }

  async changePassword(_current: string, _newPw: string) {
    return { data: null };
  }

  async getAddresses() {
    return { data: { addresses: [] } };
  }

  async addAddress(_address: any) {
    return { data: null };
  }

  async updateAddress(_addressId: string, _address: any) {
    return { data: null };
  }

  async deleteAddress(_addressId: string) {
    return { data: null };
  }

  // ── Reviews ──
  async getProductReviews(productId: string, _params?: Record<string, string>) {
    const reviews = await loadReviews();
    const productReviews = reviews!.filter((r: any) => r.product === productId);
    return { data: { reviews: productReviews } };
  }

  async createReview(_data: any) {
    return { success: false, error: 'Reviews are not available in demo mode.' };
  }

  // ── Coupons ──
  async validateCoupon(code: string, cartTotal: number) {
    if (code.toUpperCase() === 'CUTIFY10' && cartTotal >= 500) {
      return { data: { valid: true, type: 'percentage', value: 10, discount: Math.min(cartTotal * 0.1, 200) } };
    }
    if (code.toUpperCase() === 'WELCOME20' && cartTotal >= 300) {
      return { data: { valid: true, type: 'percentage', value: 20, discount: Math.min(cartTotal * 0.2, 500) } };
    }
    return { data: { valid: false } };
  }

  // ── Generic request (for any direct /products/:id/reviews style calls) ──
  async request(endpoint: string) {
    // Handle /products/:id/reviews
    const reviewMatch = endpoint.match(/\/products\/([^/]+)\/reviews/);
    if (reviewMatch) {
      return this.getProductReviews(reviewMatch[1]);
    }
    // Handle /categories/:slug/products
    const catProdMatch = endpoint.match(/\/categories\/([^/]+)\/products/);
    if (catProdMatch) {
      return this.getCategoryProducts(catProdMatch[1]);
    }
    // Fallback
    return { data: null };
  }

  // ── Admin APIs (no-op for static site) ──
  async getAdminDashboard() { return { data: null }; }
  async getAdminProducts(_params?: Record<string, string>) { return { data: { products: [] } }; }
  async createProduct(_data: any) { return { data: null }; }
  async updateProduct(_id: string, _data: any) { return { data: null }; }
  async deleteProduct(_id: string) { return { data: null }; }
  async uploadProductImages(_id: string, _formData: FormData) { return { data: null }; }
  async getAdminCategories(_params?: Record<string, string>) { return { data: { categories: [] } }; }
  async createCategory(_data: any) { return { data: null }; }
  async updateCategory(_id: string, _data: any) { return { data: null }; }
  async deleteCategory(_id: string) { return { data: null }; }
  async getAdminOrders(_params?: Record<string, string>) { return { data: { orders: [] } }; }
  async getAdminOrder(_id: string) { return { data: null }; }
  async updateOrderStatus(_id: string, _status: string) { return { data: null }; }
  async getAdminCoupons(_params?: Record<string, string>) { return { data: { coupons: [] } }; }
  async getAdminCoupon(_id: string) { return { data: null }; }
  async createCoupon(_data: any) { return { data: null }; }
  async updateCoupon(_id: string, _data: any) { return { data: null }; }
  async deleteCoupon(_id: string) { return { data: null }; }
  async getAdminUsers(_params?: Record<string, string>) { return { data: { users: [] } }; }
  async updateUserRole(_id: string, _role: string) { return { data: null }; }
  async toggleUserStatus(_id: string) { return { data: null }; }
  async getAdminInventory() { return { data: null }; }
}

export const api = new StaticApiClient();
export default api;
