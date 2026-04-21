import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, User, Heart, ShoppingCart, Shield, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, normalizeProduct, normalizeCategory } from '../data/mockData';
import api from '../api/client';
import { OptimizedImage } from './OptimizedImage';

/* ─── Category nav data with sub-items ─── */
const navCategories = [
  {
    label: '🏠 Home',
    href: '/',
    subItems: [],
  },
  {
    label: '✨ Accessories',
    href: '/',
    subItems: [
      { name: 'Hair Clips & Pins', href: '/' },
      { name: 'Earrings', href: '/' },
      { name: 'Necklaces', href: '/' },
      { name: 'Bracelets', href: '/' },
      { name: 'Rings', href: '/' },
      { name: 'Hair Bands', href: '/' },
    ],
  },
  {
    label: '📝 Stationery',
    href: '/',
    subItems: [
      { name: 'Notebooks', href: '/' },
      { name: 'Gel Pens', href: '/' },
      { name: 'Sticker Sheets', href: '/' },
      { name: 'Washi Tapes', href: '/' },
      { name: 'Pencil Cases', href: '/' },
      { name: 'Erasers & Sharpeners', href: '/' },
    ],
  },
  {
    label: '🏡 Home Decor',
    href: '/',
    subItems: [
      { name: 'LED Lights', href: '/' },
      { name: 'Wall Art', href: '/' },
      { name: 'Cushions', href: '/' },
      { name: 'Desk Organizers', href: '/' },
      { name: 'Fairy Lights', href: '/' },
      { name: 'Photo Frames', href: '/' },
    ],
  },
  {
    label: '📱 Phone Cases',
    href: '/',
    subItems: [
      { name: 'iPhone Cases', href: '/' },
      { name: 'Samsung Cases', href: '/' },
      { name: 'Grip Holders', href: '/' },
      { name: 'Phone Charms', href: '/' },
    ],
  },
  {
    label: '🧸 Plushies & Bags',
    href: '/',
    subItems: [
      { name: 'Plushies', href: '/' },
      { name: 'Tote Bags', href: '/' },
      { name: 'Mini Backpacks', href: '/' },
      { name: 'Crossbody Bags', href: '/' },
    ],
  },
];

export const Header: React.FC = () => {
  const { cartCount, wishlist, isAuthenticated, user, logout, setIsCartOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<number | null>(null);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories & products from API
  useEffect(() => {
    api.getCategories().then((res) => {
      const cats = (res.data?.categories || res.data || []).map(normalizeCategory);
      setApiCategories(cats);
    }).catch(() => {});
    api.getProducts({ limit: '50' }).then((res) => {
      const prods = (res.data?.products || res.data || []).map(normalizeProduct);
      setApiProducts(prods);
    }).catch(() => {});
  }, []);

  // Build navCategories dynamically from API categories
  const navCategories = [
    { label: '🏠 Home', href: '/', subItems: [] as { name: string; href: string }[], slug: '' },
    ...apiCategories.map((cat) => ({
      label: `✨ ${cat.name}`,
      href: `/category/${cat.slug || cat._id}`,
      subItems: [] as { name: string; href: string }[],
      slug: cat.slug || '',
    })),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleCatEnter = (i: number) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setHoveredCat(i);
  };

  const handleCatLeave = () => {
    megaTimeout.current = setTimeout(() => setHoveredCat(null), 150);
  };

  // Get featured products for mega menu from API data
  const getFeaturedProducts = (label: string) => {
    const catName = label.replace(/^[^\s]+\s/, '');
    return apiProducts.filter(p => {
      const pCatName = typeof p.category === 'object' ? p.category.name : p.category;
      return pCatName?.toLowerCase().includes(catName.toLowerCase());
    }).slice(0, 3);
  };

  return (
    <>
      {/* ─── Main Header Row (scrolls away) ─── */}
      <div className="bg-white shadow-sm relative z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <h1 className="font-pacifico text-3xl sm:text-4xl bg-gradient-to-r from-[#e8508a] to-[#c964cf] bg-clip-text text-transparent">
                Cutify
              </h1>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search the store"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-md border-2 border-gray-300 focus:border-[#e8508a] focus:outline-none transition-colors text-sm bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 px-4 bg-transparent hover:bg-gray-50 rounded-r-md transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Need Help - Desktop */}
              <div className="hidden xl:flex flex-col items-end mr-2 text-xs">
                <span className="text-gray-500">Need Help? Let's Chat</span>
                <span className="font-bold text-gray-800 text-sm">+92 330 6387976</span>
              </div>

              {/* Admin Link */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white hover:shadow-lg transition-all text-xs"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] text-gray-500 hidden sm:block mt-0.5">Wish Lists</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-[#e8508a] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Sign In / Logout */}
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-gray-700" />
                  <span className="text-[10px] text-gray-500 hidden sm:block mt-0.5">Logout</span>
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="text-[10px] text-gray-500 hidden sm:block mt-0.5">Sign In</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] text-gray-500 hidden sm:block mt-0.5">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-[#e8508a] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="sm:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search the store"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 rounded-md border-2 border-gray-300 focus:border-[#e8508a] focus:outline-none transition-colors text-sm"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 cursor-pointer">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Category Navigation Bar (sticky) ─── */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#e8508a] via-[#d946a8] to-[#c964cf] shadow-md hidden lg:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-0">
            {navCategories.map((cat, i) => (
              <li
                key={i}
                className="relative"
                onMouseEnter={() => handleCatEnter(i)}
                onMouseLeave={handleCatLeave}
              >
                <Link
                  to={cat.href}
                  className="flex items-center gap-1 px-4 py-3 text-white text-sm font-semibold hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  {cat.label}
                  {cat.subItems.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                </Link>

                {/* ─── Mega Dropdown ─── */}
                <AnimatePresence>
                  {hoveredCat === i && cat.subItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full bg-white rounded-b-xl shadow-2xl border border-gray-100 min-w-[520px] p-6 grid grid-cols-2 gap-x-10 gap-y-0"
                      onMouseEnter={() => handleCatEnter(i)}
                      onMouseLeave={handleCatLeave}
                    >
                      {/* Subcategory links */}
                      <div>
                        <p className="text-xs font-bold text-[#e8508a] uppercase tracking-wider mb-3">
                          {cat.label.replace(/^[^\s]+\s/, '')}
                        </p>
                        <ul className="space-y-1.5">
                          {cat.subItems.map((sub, j) => (
                            <li key={j}>
                              <Link
                                to={sub.href}
                                className="text-sm text-gray-600 hover:text-[#e8508a] hover:pl-1 transition-all block py-1"
                                onClick={() => setHoveredCat(null)}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Featured products */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Featured
                        </p>
                        <div className="space-y-3">
                          {getFeaturedProducts(cat.label).map((p) => (
                            <Link
                              key={p._id || p.id}
                              to={`/product/${p.slug || p._id}`}
                              className="flex items-center gap-3 group"
                              onClick={() => setHoveredCat(null)}
                            >
                              <OptimizedImage
                                src={p.image || p.images?.[0] || ''}
                                alt={p.name}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-100 group-hover:border-[#e8508a] transition-colors"
                                srcSetWidths={[56, 112]}
                                sizes="56px"
                                quality={70}
                              />
                              <div>
                                <p className="text-sm text-gray-700 group-hover:text-[#e8508a] transition-colors font-medium leading-tight">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {p.salePrice ? (
                                    <><span className="line-through mr-1">{p.price}</span><span className="text-red-500 font-semibold">{p.salePrice} PKR</span></>
                                  ) : (
                                    <span>{p.price} PKR</span>
                                  )}
                                </p>
                              </div>
                            </Link>
                          ))}
                          {getFeaturedProducts(cat.label).length === 0 && (
                            <p className="text-xs text-gray-400 italic">Coming soon...</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden relative z-10"
          >
            <div className="container mx-auto px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
              {navCategories.map((cat, i) => (
                <div key={i}>
                  <button
                    onClick={() => {
                      if (cat.subItems.length > 0) {
                        setMobileSub(mobileSub === i ? null : i);
                      } else {
                        navigate(cat.href);
                        setMobileOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-between py-3 px-3 text-gray-700 font-semibold text-sm hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{cat.label}</span>
                    {cat.subItems.length > 0 && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileSub === i ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {mobileSub === i && cat.subItems.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pb-2 space-y-1">
                          {cat.subItems.map((sub, j) => (
                            <Link
                              key={j}
                              to={sub.href}
                              className="block py-2 px-3 text-sm text-gray-500 hover:text-[#e8508a] hover:bg-pink-50 rounded-lg transition-colors"
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
