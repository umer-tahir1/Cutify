import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown, X, Search, PackageOpen } from 'lucide-react';
import { Product, Category, normalizeProduct, normalizeCategory } from '../data/mockData';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { ProductCard } from '../components/ProductCard';
import { OptimizedImage } from '../components/OptimizedImage';
import api from '../api/client';

// ── Sort options ──
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
];

// ── Price ranges for filter ──
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under Rs.500', min: 0, max: 499 },
  { label: 'Rs.500 – Rs.1,000', min: 500, max: 1000 },
  { label: 'Rs.1,000 – Rs.2,000', min: 1000, max: 2000 },
  { label: 'Rs.2,000 – Rs.5,000', min: 2000, max: 5000 },
  { label: 'Over Rs.5,000', min: 5000, max: Infinity },
];

// ── Skeleton card loader ──
const ProductSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-border bg-white overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-accent/60" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-accent rounded-full w-16" />
      <div className="h-4 bg-accent rounded-full w-3/4" />
      <div className="h-4 bg-accent rounded-full w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="h-9 bg-accent rounded-full flex-1" />
        <div className="h-9 w-9 bg-accent rounded-full" />
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════
// ── Category Page ──
// ══════════════════════════════════════════════════
export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // ── State ──
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Filters & sorting
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // ── Fetch category + products ──
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setProducts([]);
    setCategory(null);
    // Reset filters on category change
    setSortBy('default');
    setPriceRange(0);
    setSearchQuery('');
    setInStockOnly(false);
    setOnSaleOnly(false);

    api.getCategoryProducts(slug)
      .then((res) => {
        const catData = res.data?.category;
        const prodData = res.data?.products || [];

        if (!catData) {
          setNotFound(true);
          return;
        }

        setCategory(normalizeCategory(catData));
        setProducts(prodData.map(normalizeProduct));
      })
      .catch((err) => {
        if (err?.message?.includes('404') || err?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Set document title ──
  useEffect(() => {
    if (category) {
      document.title = `${category.name} – Cutify | Cute Things for Cute People`;
      // Set meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', category.description || `Shop ${category.name} at Cutify. Discover adorable ${category.name.toLowerCase()} that bring joy to your life.`);
      }
    }
    return () => { document.title = 'Cutify – Cute Things for Cute People'; };
  }, [category]);

  // ── Filter + sort logic (client side) ──
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Price range filter
    const range = PRICE_RANGES[priceRange];
    if (range && range.max !== Infinity || range.min > 0) {
      result = result.filter(p => {
        const price = p.salePrice || p.price;
        return price >= range.min && price <= range.max;
      });
    }

    // In-stock filter
    if (inStockOnly) {
      result = result.filter(p => (p.stock ?? 0) > 0);
    }

    // On-sale filter
    if (onSaleOnly) {
      result = result.filter(p => p.salePrice && p.salePrice < p.price);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => {
          const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
          const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
          return db - da;
        });
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, priceRange, inStockOnly, onSaleOnly, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceRange > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [priceRange, inStockOnly, onSaleOnly, searchQuery]);

  const clearFilters = useCallback(() => {
    setPriceRange(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchQuery('');
  }, []);

  // ── 404 ──
  if (notFound && !loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-7xl mb-6">🔍</div>
            <h1 className="text-3xl sm:text-4xl font-pacifico mb-4 text-foreground">Category Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the category you're looking for. It may have been removed or the URL is incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#e8508a] to-[#c964cf] hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all"
              >
                Back to Home
              </Link>
              <Link
                to="/#categories"
                className="px-8 py-3 rounded-full font-semibold border-2 border-foreground text-foreground hover:bg-foreground hover:text-white transition-all"
              >
                Browse Categories
              </Link>
            </div>
          </motion.div>
        </main>
        <StoreRating />
        <Footer />
      </>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="container mx-auto px-4 pb-16">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 py-6">
            <div className="h-4 w-12 bg-accent rounded animate-pulse" />
            <div className="h-4 w-4 bg-accent rounded animate-pulse" />
            <div className="h-4 w-24 bg-accent rounded animate-pulse" />
          </div>

          {/* Hero skeleton */}
          <div className="rounded-3xl overflow-hidden mb-10 h-48 sm:h-64 bg-accent/60 animate-pulse" />

          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="h-5 w-32 bg-accent rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-accent rounded-xl animate-pulse" />
              <div className="h-10 w-10 bg-accent rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </main>
        <StoreRating />
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 pb-16">
        {/* ── Breadcrumb ── */}
        <motion.nav
          className="flex items-center gap-2 text-sm py-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-[#d94f8a] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{category?.name}</span>
        </motion.nav>

        {/* ── Category Hero Banner ── */}
        <motion.section
          className="relative rounded-3xl overflow-hidden mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background image with overlay */}
          <div className="relative h-48 sm:h-64 lg:h-72">
            {category?.image && (
              <OptimizedImage
                src={category.image}
                alt={category.name || ''}
                className="absolute inset-0 w-full h-full object-cover"
                srcSetWidths={[400, 800, 1200]}
                sizes="100vw"
                quality={75}
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-14">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#e8508a] mb-2 sm:mb-3">
                  Cutify Collection
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                  {category?.name}
                </h1>
                <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
                  {category?.description || `Discover our adorable collection of ${category?.name?.toLowerCase()}.`}
                </p>
                <div className="flex items-center gap-4 mt-3 sm:mt-4">
                  <span className="text-white/60 text-sm">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── Toolbar: Search, Sort, Filters, Grid Toggle ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Left: product count + active filters */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of{' '}
              <span className="font-semibold text-foreground">{products.length}</span> products
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#e8508a] hover:text-[#d43d78] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8508a]/30 focus:border-[#e8508a] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium hover:border-[#e8508a]/40 transition-colors cursor-pointer whitespace-nowrap"
              >
                {SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Sort'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-border rounded-xl shadow-xl z-40 py-1.5 overflow-hidden"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            sortBy === opt.value
                              ? 'bg-[#e8508a]/10 text-[#e8508a] font-medium'
                              : 'text-foreground hover:bg-accent/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#e8508a] bg-[#e8508a]/5 text-[#e8508a]'
                  : 'border-border bg-white text-foreground hover:border-[#e8508a]/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#e8508a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Grid toggle (desktop only) */}
            <div className="hidden lg:flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 transition-colors cursor-pointer ${gridCols === 3 ? 'bg-foreground text-white' : 'bg-white text-muted-foreground hover:text-foreground'}`}
                title="3 columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2.5 transition-colors cursor-pointer ${gridCols === 4 ? 'bg-foreground text-white' : 'bg-white text-muted-foreground hover:text-foreground'}`}
                title="4 columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Filter Panel (collapsible) ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm">Filter Products</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[#e8508a] hover:text-[#d43d78] transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Price range */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Price Range
                    </label>
                    <div className="space-y-1.5">
                      {PRICE_RANGES.map((range, i) => (
                        <button
                          key={i}
                          onClick={() => setPriceRange(i)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                            priceRange === i
                              ? 'bg-[#e8508a]/10 text-[#e8508a] font-medium'
                              : 'text-foreground hover:bg-accent/60'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Availability
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-[#e8508a] focus:ring-[#e8508a]/30 cursor-pointer accent-[#e8508a]"
                        />
                        <span className="text-sm text-foreground group-hover:text-[#e8508a] transition-colors">
                          In Stock Only
                        </span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={onSaleOnly}
                          onChange={(e) => setOnSaleOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-[#e8508a] focus:ring-[#e8508a]/30 cursor-pointer accent-[#e8508a]"
                        />
                        <span className="text-sm text-foreground group-hover:text-[#e8508a] transition-colors">
                          On Sale
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product Grid ── */}
        {filteredProducts.length > 0 ? (
          <motion.div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 ${
              gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* ── Empty state ── */
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-accent/60 flex items-center justify-center mb-5">
              <PackageOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              {activeFilterCount > 0
                ? 'No products match your current filters. Try adjusting your search or filters.'
                : `There are no products in ${category?.name || 'this category'} yet. Check back soon!`}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#e8508a] to-[#c964cf] hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* ── Bottom CTA ── */}
        {filteredProducts.length > 0 && (
          <motion.div
            className="flex justify-center mt-12 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              to="/"
              className="px-8 py-3 rounded-full text-sm font-semibold border-2 border-foreground text-foreground hover:bg-foreground hover:text-white transition-all"
            >
              Continue Shopping
            </Link>
          </motion.div>
        )}
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
