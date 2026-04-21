import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/mockData';
import api from '../api/client';

interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountAmount: number;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: { name: string; email: string; role?: string } | null;
  setUser: (user: { name: string; email: string; role?: string } | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cutify-cart');
    const savedWishlist = localStorage.getItem('cutify-wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Auto-check auth on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('cutify-token');
    if (token && !isAuthenticated) {
      api.getMe().then((res) => {
        if (res.data?.user) {
          setUser({ name: res.data.user.name, email: res.data.user.email, role: res.data.user.role });
          setIsAuthenticated(true);
        }
      }).catch(() => {
        localStorage.removeItem('cutify-token');
        localStorage.removeItem('cutify-refresh-token');
      });
    }
  }, []);

  const logout = async () => {
    try { await api.logout(); } catch { }
    setIsAuthenticated(false);
    setUser(null);
  };

  // Save to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cutify-cart', JSON.stringify(cart));
  }, [cart]);

  // Save to localStorage when wishlist changes
  useEffect(() => {
    localStorage.setItem('cutify-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const pid = product._id || product.id || '';
      const existing = prev.find((item) => (item._id || item.id) === pid);
      if (existing) {
        return prev.map((item) =>
          (item._id || item.id) === pid ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => ((item._id || item.id) === productId ? { ...item, quantity } : item))
    );
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      const pid = product._id || product.id || '';
      if (prev.find((item) => (item._id || item.id) === pid)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  );

  // Simple discount calculation (10% off for "CUTIFY10")
  const discountAmount =
    discountCode.toUpperCase() === 'CUTIFY10' ? cartTotal * 0.1 : 0;

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartCount,
        cartTotal,
        discountCode,
        setDiscountCode,
        discountAmount,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
