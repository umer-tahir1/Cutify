import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { OptimizedImage } from './OptimizedImage';
import { motion } from 'motion/react';
import { Heart, Minus, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { Product, normalizeProduct } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import api from '../api/client';

export const FanFavoriteSection: React.FC = () => {
  const [fanFav, setFanFav] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, setIsCartOpen } = useApp();

  useEffect(() => {
    api.getBestSellers().then((res) => {
      const products = (res.data?.products || res.data || []).map(normalizeProduct);
      if (products.length > 0) {
        // Pick the one with highest reviewCount
        const sorted = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        setFanFav(sorted[0]);
      }
    }).catch(() => {});
  }, []);

  if (!fanFav) return null;

  const productId = fanFav._id || fanFav.id || '';
  const inWishlist = isInWishlist(productId);
  const inStock = fanFav.inStock !== false;
  const images = fanFav.images && fanFav.images.length > 0 ? fanFav.images : [fanFav.image || ''];
  const colors = fanFav.colors ?? [];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(fanFav);
    toast.success(`Added ${qty}× to cart! 🛒`, {
      description: `${fanFav.name}${selectedColor ? ` — ${selectedColor}` : ''}`,
    });
    setTimeout(() => setIsCartOpen(true), 200);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(productId);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(fanFav);
      toast.success('Added to wishlist! 💖');
    }
  };

  const scrollThumb = (dir: 'up' | 'down') => {
    if (dir === 'up') setActiveImg((p) => (p - 1 + images.length) % images.length);
    else setActiveImg((p) => (p + 1) % images.length);
  };

  return (
    <section className="py-14 sm:py-20">
      {/* Heading */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="text-[#e8508a] text-lg">💖</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-1">Fan Favorite</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* ── LEFT: Image Gallery ── */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 lg:w-[55%]">
          {/* Thumbnails column */}
          <div className="flex sm:flex-col items-center gap-2 sm:w-20 flex-shrink-0">
            <button
              onClick={() => scrollThumb('up')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-400 cursor-pointer hidden sm:flex"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <div className="flex sm:flex-col gap-2 overflow-hidden">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                    activeImg === i ? 'border-[#e8508a]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollThumb('down')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-400 cursor-pointer hidden sm:flex"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Main image */}
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="flex-1 rounded-xl overflow-hidden bg-accent/20 aspect-square sm:aspect-auto sm:min-h-[450px]"
          >
            <OptimizedImage
              src={images[activeImg]}
              alt={fanFav.name}
              className="w-full h-full object-cover"
              srcSetWidths={[300, 500, 800]}
              sizes="(max-width: 1024px) 100vw, 55vw"
              quality={80}
              priority
            />
          </motion.div>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="lg:w-[45%] flex flex-col justify-center">
          {/* Title */}
          <Link to={`/product/${fanFav.slug || fanFav._id}`}>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-[#e8508a] transition-colors leading-snug underline decoration-1 underline-offset-4">
              {fanFav.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-500 text-sm sm:text-base mt-3 leading-relaxed">
            {fanFav.description}
          </p>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            {fanFav.salePrice ? (
              <>
                <span className="text-xl font-bold text-gray-800 line-through">{fanFav.price} PKR</span>
                <span className="text-xl font-bold text-red-600">{fanFav.salePrice} PKR</span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-800">{fanFav.price} PKR</span>
            )}
          </div>

          {/* Shipping */}
          <p className="text-sm text-gray-500 mt-2">
            <span className="underline font-medium text-gray-700">Shipping</span> calculated at checkout.
          </p>

          {/* Color */}
          {colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-bold text-gray-700 mb-2.5">
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
            <p className="text-sm font-bold text-gray-700 mb-2.5">Quantity:</p>
            <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 py-2.5 text-sm font-semibold min-w-[48px] text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {inStock ? (
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#e8508a] to-[#f48fb1] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all cursor-pointer"
              >
                Add To Cart
              </motion.button>
            ) : (
              <button
                disabled
                className="flex-1 py-3.5 rounded-full bg-gray-400 text-white font-semibold text-sm cursor-not-allowed"
              >
                Sold Out
              </button>
            )}
            <button
              onClick={handleToggleWishlist}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#e8508a] transition-colors cursor-pointer flex-shrink-0"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
