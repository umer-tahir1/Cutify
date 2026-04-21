import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { Heart, Eye, Minus, Plus } from 'lucide-react';
import { Product } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

/* ─── Image Magnifier ─── */
const ImageMagnifier: React.FC<{
  src: string;
  alt: string;
  magnifierSize?: number;
  zoomLevel?: number;
}> = ({ src, alt, magnifierSize = 140, zoomLevel = 2.5 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setPos({ x, y });
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouse}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      {show && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white/70 shadow-xl z-20"
          style={{
            width: magnifierSize,
            height: magnifierSize,
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

/* ─── Quick-View Modal (eye icon) — KawaiiStories style ─── */
const QuickViewModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, setIsCartOpen } = useApp();
  const inStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);
  const productId = product._id || product.id || '';
  const inWishlist = isInWishlist(productId);
  const colors = product.colors ?? [];
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  // Fake "sold recently" number
  const soldCount = useMemo(() => Math.floor(Math.random() * 20) + 5, []);
  const soldHours = useMemo(() => Math.floor(Math.random() * 20) + 5, []);
  const viewerCount = useMemo(() => Math.floor(Math.random() * 25) + 8, []);

  // Use real images array from API
  const thumbs = product.images && product.images.length > 0 ? product.images : [product.image || ''];

  const unitPrice = product.salePrice || product.price;
  const subtotal = unitPrice * qty;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty}× to cart! 🛒`, {
      description: `${product.name}${selectedColor ? ` — ${selectedColor}` : ''}`,
    });
    onClose();
    setTimeout(() => setIsCartOpen(true), 200);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(productId);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist! 💖');
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-[950px] w-full max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shadow-md text-xl leading-none"
          >
            ×
          </button>

          {/* ── LEFT: Image ── */}
          <div className="md:w-[48%] flex-shrink-0 p-4 sm:p-5 flex flex-col">
            {/* Main image with magnifier */}
            <div className="relative rounded-xl overflow-hidden bg-accent/20 aspect-square">
              {!inStock && (
                <span className="absolute top-3 left-3 z-10 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded">
                  Sold Out
                </span>
              )}
              <ImageMagnifier src={thumbs[activeThumb]} alt={product.name} magnifierSize={160} zoomLevel={3} />
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setActiveThumb((p) => (p - 1 + thumbs.length) % thumbs.length)}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-400 cursor-pointer flex-shrink-0"
              >
                ‹
              </button>
              <div className="flex gap-2 overflow-hidden">
                {thumbs.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                      activeThumb === i ? 'border-[#e8508a]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={t} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveThumb((p) => (p + 1) % thumbs.length)}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-400 cursor-pointer flex-shrink-0"
              >
                ›
              </button>
            </div>
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="md:w-[52%] p-5 sm:p-6 flex flex-col">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug pr-8">
              {product.name}
            </h2>

            {/* Sold recently */}
            <p className="flex items-center gap-1.5 mt-3 text-sm text-red-500 font-medium">
              <span>🔥</span> {soldCount} sold in last {soldHours} hours
            </p>

            {/* Meta info */}
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><span className="text-gray-400 w-24 inline-block">Vendor:</span> Cutify</p>
              <p><span className="text-gray-400 w-24 inline-block">Availability:</span> {inStock ? <span className="text-green-600">In Stock</span> : <span className="text-red-500">Out Of Stock</span>}</p>
              <p><span className="text-gray-400 w-24 inline-block">Product type:</span> {typeof product.category === 'object' ? product.category.name : product.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2.5 mt-4">
              {product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-gray-800 line-through">{product.price} PKR</span>
                  <span className="text-lg font-bold text-red-600">{product.salePrice} PKR</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-800">{product.price} PKR</span>
              )}
            </div>

            {/* Color */}
            {colors.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </p>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                        selectedColor === c.name ? 'border-gray-800 ring-2 ring-gray-300 scale-110' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <p className="text-sm font-bold text-gray-700 mb-2">Quantity:</p>
              <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2 text-sm font-semibold min-w-[48px] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <p className="mt-4 text-sm text-gray-600">
              Subtotal: <span className="font-bold text-gray-800 text-base">{subtotal.toLocaleString()} PKR</span>
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-5">
              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 rounded-full bg-gray-400 text-white font-semibold text-sm cursor-not-allowed"
                >
                  Sold Out
                </button>
              )}
              <button
                onClick={handleToggleWishlist}
                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer flex-shrink-0"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Buy Now */}
            {inStock && (
              <Link
                to={`/checkout`}
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(product);
                  onClose();
                }}
                className="mt-3 block text-center w-full py-3 rounded-full bg-[#b5a3e8] text-white font-semibold text-sm hover:bg-[#a08de0] transition-colors"
              >
                Buy Now
              </Link>
            )}

            {/* Viewers */}
            <p className="flex items-center gap-2 mt-5 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span><strong>{viewerCount} customers</strong> are viewing this product</span>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

/* ─── Quick-Add Overlay (on image) ─── */
const QuickAddOverlay: React.FC<{
  product: Product;
  onClose: () => void;
  onAdd: (qty: number, color: string) => void;
}> = ({ product, onClose, onAdd }) => {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name ?? '');
  const colors = product.colors ?? [];

  return (
    <motion.div
      className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {selectedColor && (
        <p className="text-sm font-medium text-gray-700 mb-2">
          Color: <span className="font-semibold">{selectedColor}</span>
        </p>
      )}

      {colors.length > 0 && (
        <div className="flex items-center gap-2.5 mb-4">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.name)}
              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                selectedColor === c.name ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-gray-700 mb-2">Quantity:</p>
      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden mb-5">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="px-4 py-1.5 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-3 w-full max-w-[240px]">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => onAdd(qty, selectedColor)}
          className="flex-1 py-2 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Main ProductCard ─── */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, setIsCartOpen } = useApp();
  const productId = product._id || product.id || '';
  const inWishlist = isInWishlist(productId);
  const inStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);
  const colors = product.colors ?? [];
  const productImage = product.image || product.images?.[0] || '';

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(productId);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist! 💖');
    }
  };

  const handleQuickAdd = (qty: number, color: string) => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty}× to cart! 🛒`, {
      description: `${product.name}${color ? ` — ${color}` : ''}`,
    });
    setShowQuickAdd(false);
    // Auto-open cart sidebar
    setTimeout(() => setIsCartOpen(true), 200);
  };

  return (
    <>
      <div className="relative group">
        {/* ── Image Area ── */}
        <div className="relative rounded-xl overflow-hidden bg-accent/20 aspect-[4/5]">
          {/* Product image — plain (magnifier only in QuickView) */}
          <Link to={`/product/${product.slug || product._id}`} className="block w-full h-full">
            <OptimizedImage
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover"
              aspectRatio="4/5"
              srcSetWidths={[200, 400, 600]}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={70}
            />
          </Link>

          {/* Hover overlay icons — wishlist + eye */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleToggleWishlist}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 transition-transform cursor-pointer"
            >
              <Heart className={`w-[18px] h-[18px] ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 transition-transform cursor-pointer"
            >
              <Eye className="w-[18px] h-[18px] text-gray-600" />
            </button>
          </div>

          {/* Out of Stock / Quick Add — bottom of image on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!inStock ? (
              <div className="bg-white/80 backdrop-blur-sm text-center py-3 text-gray-700 font-semibold text-sm tracking-wide">
                Out Of Stock
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}
                className="w-full bg-white/80 backdrop-blur-sm text-center py-3 text-gray-700 font-semibold text-sm tracking-wide hover:bg-white transition-colors cursor-pointer"
              >
                Quick Add +
              </button>
            )}
          </div>

          {/* Best seller badge */}
          {product.isBestSeller && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow">
              ⭐ Best Seller
            </div>
          )}

          {/* Quick Add overlay inside image */}
          <AnimatePresence>
            {showQuickAdd && (
              <QuickAddOverlay
                product={product}
                onClose={() => setShowQuickAdd(false)}
                onAdd={handleQuickAdd}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Product Info ── */}
        <div className="pt-3 px-0.5">
          <Link to={`/product/${product.slug || product._id}`}>
            <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 hover:text-[#e8508a] transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1.5">
            {product.salePrice ? (
              <>
                <span className="text-sm text-gray-400 line-through">{product.price} PKR</span>
                <span className="text-sm font-bold text-red-600">{product.salePrice} PKR</span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-800">{product.price} PKR</span>
            )}
          </div>

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === c.name ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal — portal-level */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
