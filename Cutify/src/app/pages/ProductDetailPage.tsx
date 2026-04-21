import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, ChevronRight, Minus, Plus, Truck, Camera, Send, Eye, Flame, X } from 'lucide-react';
import { Product, normalizeProduct } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { ProductCard } from '../components/ProductCard';
import { OptimizedImage } from '../components/OptimizedImage';
import { toast } from 'sonner';
import api from '../api/client';

// ── Types ──
type Tab = 'description' | 'specifications' | 'reviews';

interface UserReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
}

// ── Specs data (simulated per product) ──
const getSpecs = (product: Product) => {
  const catName = typeof product.category === 'object' ? product.category.name : (product.category || '');
  return [
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: catName },
    { label: 'SKU', value: product.sku || `CTF-${(product._id || product.id || '').slice(-4)}` },
    { label: 'Availability', value: (product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock' },
    { label: 'Material', value: 'Premium Quality' },
    { label: 'Brand', value: 'Cutify' },
    { label: 'Origin', value: 'Imported' },
  ];
};

// ── Extended description (simulated) ──
const getDetailedDescription = (product: Product) => {
  const base = product.description;
  const catName = typeof product.category === 'object' ? product.category.name : (product.category || '');
  const extras: Record<string, string> = {
    Accessories: `${base}. Crafted with care using premium materials, each piece is designed to add a touch of kawaii charm to your everyday look. The set comes beautifully packaged, making it a perfect gift for anyone who loves cute accessories. Features hypoallergenic materials suitable for sensitive skin.`,
    Stationery: `${base}. Made with high-quality, acid-free paper that's perfect for writing, sketching, and journaling. Each page features subtle kawaii-inspired watermarks. The covers are laminated for durability and the binding allows the pages to lay flat when open — ideal for left-handed writers too.`,
    'Home Decor': `${base}. This piece brings warmth and whimsy to any room. Energy-efficient LED technology with adjustable brightness levels. Safe for children's rooms with cool-touch exterior. Comes with a USB-C charging cable and operates up to 12 hours on a single charge.`,
    'Phone Cases': `${base}. Made from premium soft-touch silicone that provides excellent shock absorption. Raised edges protect your screen and camera from scratches. The 3D design adds a playful dimension while maintaining a slim profile that fits in any pocket.`,
    Plushies: `${base}. Handcrafted from ultra-soft polyester fiber filling and premium plush fabric. Machine washable (gentle cycle) — because we know these cuties go everywhere with you. Meets all safety standards and is suitable for ages 3+. Each plushie comes with a unique collectible tag.`,
    Bags: `${base}. Constructed from heavy-duty organic cotton canvas with reinforced stitching at all stress points. Features a secure inner pocket and magnetic snap closure. The gradient print is achieved using eco-friendly water-based inks that won't fade with washing.`,
  };
  return extras[catName] || `${base}. A beautifully crafted item from the Cutify collection, designed to bring joy and cuteness into your daily life. Made with attention to detail and premium materials.`;
};

// ── Default sample reviews ──
const getDefaultReviews = (productName: string): UserReview[] => [
  { id: 'default-1', name: 'Ayesha K.', rating: 5, date: '2 days ago', text: `Absolutely love this ${productName}! The quality exceeded my expectations. Packaging was super cute too! 💕` },
  { id: 'default-2', name: 'Fatima R.', rating: 5, date: '1 week ago', text: `So kawaii! Got it as a gift and my friend was thrilled. Fast shipping and great customer service. ✨` },
  { id: 'default-3', name: 'Zara M.', rating: 4, date: '2 weeks ago', text: `Really nice product. The colors are exactly as shown in the pictures. Would definitely recommend to anyone looking for cute items.` },
];

// ══════════════════════════════════════════════════
// ── Hook: Live Viewers Counter ──
// ══════════════════════════════════════════════════
const useLiveViewers = (productId: string) => {
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const tick = () => {
      setIsAnimating(true);
      setViewers(Math.floor(Math.random() * 20) + 1);
      setTimeout(() => setIsAnimating(false), 600);
    };
    // Random interval between 10–20 seconds
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = (Math.random() * 10 + 10) * 1000;
      timeout = setTimeout(() => { tick(); schedule(); }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [productId]);

  return { viewers, isAnimating };
};

// ══════════════════════════════════════════════════
// ── Hook: Recent Purchases (24-hour cycle, localStorage) ──
// ══════════════════════════════════════════════════
const useRecentPurchases = (productId: string) => {
  const storageKey = `cutify_purchases_${productId}`;
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize from localStorage or generate fresh
  useEffect(() => {
    const now = Date.now();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const elapsed = now - data.startTime;
        const hoursPassed = Math.floor(elapsed / (1000 * 60 * 60));

        if (elapsed >= 24 * 60 * 60 * 1000) {
          // 24h expired → reset
          const fresh = Math.floor(Math.random() * 11) + 5; // 5-15
          localStorage.setItem(storageKey, JSON.stringify({ startTime: now, base: fresh, increments: 0 }));
          setCount(fresh);
        } else {
          // Continue cycle, apply increments for hours passed
          const newIncrements = Math.max(hoursPassed, data.increments);
          const total = data.base + newIncrements;
          localStorage.setItem(storageKey, JSON.stringify({ ...data, increments: newIncrements }));
          setCount(total);
        }
      } else {
        const fresh = Math.floor(Math.random() * 16) + 5; // 5-20
        localStorage.setItem(storageKey, JSON.stringify({ startTime: now, base: fresh, increments: 0 }));
        setCount(fresh);
      }
    } catch {
      const fresh = Math.floor(Math.random() * 16) + 5;
      setCount(fresh);
    }
  }, [storageKey]);

  // Hourly increment
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          const elapsed = now - data.startTime;
          if (elapsed >= 24 * 60 * 60 * 1000) {
            const fresh = Math.floor(Math.random() * 11) + 5;
            localStorage.setItem(storageKey, JSON.stringify({ startTime: now, base: fresh, increments: 0 }));
            setCount(fresh);
          } else {
            const hoursPassed = Math.floor(elapsed / (1000 * 60 * 60));
            if (hoursPassed > data.increments) {
              const newData = { ...data, increments: hoursPassed };
              localStorage.setItem(storageKey, JSON.stringify(newData));
              setIsAnimating(true);
              setCount(data.base + hoursPassed);
              setTimeout(() => setIsAnimating(false), 600);
            }
          }
        }
      } catch { /* noop */ }
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [storageKey]);

  return { count, isAnimating };
};

// ══════════════════════════════════════════════════
// ── Hook: Persisted User Reviews ──
// ══════════════════════════════════════════════════
const useUserReviews = (productId: string, productName: string) => {
  const storageKey = `cutify_reviews_${productId}`;

  const [userReviews, setUserReviews] = useState<UserReview[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const allReviews = useMemo(
    () => [...userReviews, ...getDefaultReviews(productName)],
    [userReviews, productName]
  );

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    return parseFloat((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1));
  }, [allReviews]);

  const starBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star
    allReviews.forEach(r => { counts[r.rating - 1]++; });
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star - 1],
      pct: allReviews.length > 0 ? Math.round((counts[star - 1] / allReviews.length) * 100) : 0,
    }));
  }, [allReviews]);

  const addReview = useCallback((review: Omit<UserReview, 'id' | 'date'>) => {
    const newReview: UserReview = {
      ...review,
      id: `user-${Date.now()}`,
      date: 'Just now',
    };
    setUserReviews(prev => {
      const updated = [newReview, ...prev];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  return { allReviews, userReviews, avgRating, starBreakdown, totalCount: allReviews.length, addReview };
};

// ══════════════════════════════════════════════════
// ── Star Rating Display Component ──
// ══════════════════════════════════════════════════
const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : i < rating ? 'fill-amber-400/50 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════
// ── Interactive Star Rating Input ──
// ══════════════════════════════════════════════════
const StarRatingInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starVal = i + 1;
        const active = starVal <= (hover || value);
        return (
          <motion.button
            key={i}
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(starVal)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(starVal)}
            className="cursor-pointer p-0.5"
          >
            <Star className={`w-7 h-7 transition-colors duration-150 ${active ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
          </motion.button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Great' : 'Excellent!'}
        </span>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════
// ── Success Sparkle Animation ──
// ══════════════════════════════════════════════════
const ReviewSuccessAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      id: i,
      emoji: ['💖', '✨', '🌸', '⭐', '💕', '🎀'][i % 6],
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      delay: Math.random() * 0.3,
      scale: 0.6 + Math.random() * 0.8,
    })),
    []
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute text-2xl"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, p.scale, p.scale, 0], x: p.x, y: p.y }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-xl border border-[#e8508a]/20 text-center"
      >
        <p className="text-xl font-bold text-foreground">Thank you! 💖</p>
        <p className="text-sm text-muted-foreground">Your review has been submitted</p>
      </motion.div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════
// ── Animated Number Display ──
// ══════════════════════════════════════════════════
const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    const diff = value - prev;
    const steps = Math.min(Math.abs(diff), 20);
    const stepDuration = 400 / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round(prev + (diff * step) / steps));
      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return <span className={className}>{display}</span>;
};

// ══════════════════════════════════════════════════
// ── Hook: Sold Recently (random hours) ──
// ══════════════════════════════════════════════════
const useSoldRecently = (productId: string) => {
  const [sold] = useState(() => Math.floor(Math.random() * 30) + 5);
  const [hours] = useState(() => Math.floor(Math.random() * 20) + 3);
  return { sold, hours };
};

// ── Delivery date helper ──
const getDeliveryDates = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 3);
  const end = new Date(now);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return { start: fmt(start), end: fmt(end) };
};

// ══════════════════════════════════════════════════
// ── Product Info Column (right side) ──
// ══════════════════════════════════════════════════
interface ProductInfoColumnProps {
  product: Product;
  displayPrice: number;
  discount: number;
  avgRating: number;
  totalCount: number;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  inWishlist: boolean;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  handleToggleWishlist: () => void;
  detailedDesc: string;
}

const ProductInfoColumn: React.FC<ProductInfoColumnProps> = ({
  product, displayPrice, discount, avgRating, totalCount, quantity, setQuantity,
  inWishlist, handleAddToCart, handleBuyNow, handleToggleWishlist, detailedDesc,
}) => {
  const { viewers } = useLiveViewers(product._id || product.id || '');
  const { sold, hours } = useSoldRecently(product._id || product.id || '');
  const delivery = useMemo(() => getDeliveryDates(), []);

  // Category-specific "WHAT YOU'LL GET" items
  const whatYouGet = useMemo(() => {
    const catName = typeof product.category === 'object' ? product.category.name : (product.category || '');
    const items: Record<string, string[]> = {
      Accessories: [`x1 ${product.name}`, 'x1 Cutify Gift Box', 'with FREE Delivery'],
      Stationery: [`x1 ${product.name}`, 'x1 Sticker Sheet', 'with FREE Delivery'],
      'Home Decor': [`x1 ${product.name}`, 'x1 USB-C Charging Cable', 'with FREE Delivery'],
      'Phone Cases': [`x1 ${product.name}`, 'x1 Microfiber Cloth', 'with FREE Delivery'],
      Plushies: [`x1 ${product.name}`, 'x1 Collectible Tag', 'with FREE Delivery'],
      Bags: [`x1 ${product.name}`, 'x1 Dust Bag', 'with FREE Delivery'],
    };
    return items[catName] || [`x1 ${product.name}`, 'with FREE Delivery'];
  }, [product]);

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
    >
      {/* Brand */}
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c964cf] mb-3">
        CUTIFY
      </span>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-foreground leading-tight mb-2">
        {product.name}
      </h1>

      {/* Price row: strikethrough original first, then sale price */}
      <div className="flex items-baseline gap-3 mb-1">
        {product.salePrice ? (
          <>
            <span className="text-lg text-muted-foreground line-through">
              Rs.{product.price.toLocaleString()}.00
            </span>
            <span className="text-2xl font-bold text-[#e8508a]">
              Rs.{product.salePrice.toLocaleString()}.00
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-foreground">
            Rs.{product.price.toLocaleString()}.00
          </span>
        )}
      </div>

      {/* Shipping note */}
      <p className="text-xs text-muted-foreground mb-4">
        <span className="underline cursor-pointer hover:text-foreground transition-colors">Shipping</span> calculated at checkout.
      </p>

      {/* Quantity */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground block mb-2">Quantity</label>
        <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-3.5 py-2.5 hover:bg-accent transition-colors cursor-pointer border-r border-border"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-6 py-2.5 text-sm font-medium min-w-[3.5rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => Math.min(10, q + 1))}
            className="px-3.5 py-2.5 hover:bg-accent transition-colors cursor-pointer border-l border-border"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action buttons — side by side */}
      <div className="flex gap-3 mb-4">
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center py-3 rounded-full font-semibold text-sm border-2 border-foreground text-foreground hover:bg-foreground hover:text-white transition-all cursor-pointer"
        >
          Add to cart
        </motion.button>
        <motion.button
          onClick={handleBuyNow}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center py-3 rounded-full font-semibold text-sm text-white bg-foreground hover:bg-foreground/90 transition-all cursor-pointer"
        >
          Buy it now
        </motion.button>
      </div>

      {/* Wishlist link */}
      <button
        onClick={handleToggleWishlist}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#e8508a] transition-colors mb-4 cursor-pointer self-start"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </button>

      {/* ── Social Proof Indicators (inline text) ── */}
      <div className="space-y-2.5 py-4 border-t border-border">
        {/* Sold recently */}
        <motion.div
          className="flex items-start gap-2.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          <Flame className="w-4.5 h-4.5 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-snug">
            <span className="font-bold"><AnimatedNumber value={sold} /></span> sold in last <span className="font-bold">{hours}</span> hours
          </p>
        </motion.div>

        {/* Fast delivery */}
        <motion.div
          className="flex items-start gap-2.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <Truck className="w-4.5 h-4.5 text-[#c964cf] mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-snug">
            <span className="font-bold">FAST DELIVERY ALERT!</span> Order now to get it between{' '}
            <span className="font-bold underline">{delivery.start}</span> and{' '}
            <span className="font-bold underline">{delivery.end}</span>
          </p>
        </motion.div>

        {/* Live viewers */}
        <motion.div
          className="flex items-start gap-2.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <Eye className="w-4.5 h-4.5 text-[#e8508a] mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-snug">
            <span className="font-bold"><AnimatedNumber value={viewers} /></span> People are viewing this right now
          </p>
        </motion.div>
      </div>

      {/* ── Product Description ── */}
      <div className="py-4 border-t border-border">
        <p className="text-sm leading-[1.7] text-muted-foreground">
          {product.description}
        </p>
      </div>

      {/* ── WHAT YOU'LL GET ── */}
      <div className="py-4 border-t border-border">
        <p className="font-bold text-sm text-foreground mb-2 uppercase tracking-wide">WHAT YOU'LL GET:</p>
        <ul className="space-y-1.5">
          {whatYouGet.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c964cf] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ── Main Component ──
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [youMayLike, setYouMayLike] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgLoaded(false);
    setSelectedImage(0);

    api.getProduct(id).then(res => {
      const raw = res.data?.product;
      if (raw) {
        const p = normalizeProduct(raw);
        setProduct(p);

        // Fetch related products (same category)
        const catId = typeof raw.category === 'object' ? raw.category._id : raw.category;
        if (catId) {
          api.getProducts({ category: catId, limit: '5' }).then(relRes => {
            const prods = (relRes.data?.products || [])
              .map(normalizeProduct)
              .filter((rp: Product) => (rp._id || rp.id) !== (p._id || p.id));
            setRelated(prods.slice(0, 4));
          }).catch(() => {});
        }

        // Fetch you may also like
        api.getProducts({ limit: '8', sort: '-rating' }).then(likeRes => {
          const prods = (likeRes.data?.products || [])
            .map(normalizeProduct)
            .filter((rp: Product) => (rp._id || rp.id) !== (p._id || p.id));
          setYouMayLike(prods.slice(0, 4));
        }).catch(() => {});
      } else {
        setProduct(null);
      }
    }).catch(() => {
      setProduct(null);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // Reviews system
  const productId = product?._id || product?.id || id || '';
  const {
    allReviews, avgRating, starBreakdown, totalCount, addReview,
  } = useUserReviews(productId, product?.name || '');

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inWishlist = product ? isInWishlist(product._id || product.id || '') : false;

  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#e8508a] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <StoreRating />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-6">🔍</div>
            <h1 className="text-3xl font-pacifico mb-4 text-foreground">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">Sorry, we couldn't find the product you're looking for.</p>
            <Link to="/" className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#e8508a] to-[#c964cf] hover:shadow-lg transition-all">
              Back to Home
            </Link>
          </motion.div>
        </main>
        <StoreRating />
        <Footer />
      </>
    );
  }

  const specs = getSpecs(product);
  const detailedDesc = getDetailedDescription(product);
  const displayPrice = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart! 🛒`, { description: product.name });
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    window.location.href = '/checkout';
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product._id || product.id || '');
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist! 💖');
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${totalCount})` },
  ];

  // ── Review form submit handler ──
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (reviewRating === 0) errors.rating = 'Please select a star rating';
    if (reviewName.trim().length < 2) errors.name = 'Name is required';
    if (!reviewEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewEmail)) errors.email = 'Valid email is required';
    if (reviewText.trim().length < 20) errors.text = `Review must be at least 20 characters (${reviewText.trim().length}/20)`;

    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      return;
    }

    addReview({
      name: reviewName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      image: reviewImage || undefined,
    });

    // Reset form
    setReviewRating(0);
    setReviewText('');
    setReviewName('');
    setReviewEmail('');
    setReviewImage(null);
    setReviewErrors({});
    setShowSuccess(true);
    toast.success('Review submitted! 💖');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setReviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 pb-16">
        {/* ── Breadcrumb ── */}
        <motion.nav
          className="flex items-center gap-2 text-sm py-6 text-muted-foreground"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        >
          <Link to="/" className="hover:text-[#d94f8a] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-[#d94f8a] transition-colors cursor-pointer">{typeof product.category === 'object' ? product.category.name : product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </motion.nav>

        {/* ── Top Section: Image + Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-white border border-border shadow-sm group">
              {/* Sale badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-[#e8508a] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                  −{discount}% OFF
                </div>
              )}
              {product.isBestSeller && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                  ⭐ Best Seller
                </div>
              )}
              <div className="aspect-square overflow-hidden">
                <OptimizedImage
                  src={(product.images && product.images.length > 0) ? product.images[selectedImage] : (product.image || '')}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105`}
                  aspectRatio="1/1"
                  srcSetWidths={[400, 600, 800]}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                  priority
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mt-4">
              {(product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean).map((img, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedImage(i); setImgLoaded(false); }}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    i === selectedImage ? 'border-[#d94f8a] shadow-md' : 'border-border hover:border-[#c964cf]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <ProductInfoColumn
            product={product}
            displayPrice={displayPrice}
            discount={discount}
            avgRating={avgRating}
            totalCount={totalCount}
            quantity={quantity}
            setQuantity={setQuantity}
            inWishlist={inWishlist}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            handleToggleWishlist={handleToggleWishlist}
            detailedDesc={detailedDesc}
          />
        </div>

        {/* ── Tabs Section ── */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Tab headers */}
          <div className="flex border-b border-border mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-4 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-[#d94f8a]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#e8508a] to-[#c964cf] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="desc">
                <h3 className="text-xl font-bold text-foreground mb-4">About This Product</h3>
                <p className="text-[15px] leading-[1.85] text-muted-foreground mb-6">
                  {detailedDesc}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { emoji: '✨', title: 'Premium Quality', desc: 'Carefully selected materials' },
                    { emoji: '🎁', title: 'Gift Ready', desc: 'Beautiful packaging included' },
                    { emoji: '💖', title: 'Made with Love', desc: 'Designed for kawaii lovers' },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-accent/40 border border-border/50">
                      <span className="text-2xl">{f.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="specs">
                <h3 className="text-xl font-bold text-foreground mb-4">Product Specifications</h3>
                <div className="rounded-xl overflow-hidden border border-border">
                  {specs.map((spec, i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? 'bg-accent/30' : 'bg-white'}`}
                    >
                      <div className="w-1/3 sm:w-1/4 px-5 py-3.5 text-sm font-semibold text-foreground border-r border-border">
                        {spec.label}
                      </div>
                      <div className="flex-1 px-5 py-3.5 text-sm text-muted-foreground">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="reviews" className="relative">
                <AnimatePresence>
                  {showSuccess && <ReviewSuccessAnimation onComplete={() => setShowSuccess(false)} />}
                </AnimatePresence>

                {/* ── Review Summary Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Customer Reviews</h3>
                    <div className="flex items-center gap-3">
                      <StarRating rating={avgRating} />
                      <span className="text-sm text-muted-foreground">Based on {totalCount} reviews</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#e8508a]/10 to-[#c964cf]/10 rounded-xl px-5 py-3">
                    <span className="text-3xl font-bold text-foreground">{avgRating}</span>
                    <div>
                      <StarRating rating={avgRating} size="sm" />
                      <p className="text-xs text-muted-foreground mt-0.5">{totalCount} ratings</p>
                    </div>
                  </div>
                </div>

                {/* ── Rating Breakdown Bars ── */}
                <div className="space-y-2 mb-10">
                  {starBreakdown.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{star}★</span>
                      <div className="flex-1 h-2.5 bg-accent rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * star }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                    </div>
                  ))}
                </div>

                {/* ── Write a Review Form ── */}
                <div className="mb-10 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-[#e8508a]/30 bg-gradient-to-br from-[#e8508a]/[0.03] to-[#c964cf]/[0.03]">
                  <h4 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                    ✍️ Write a Review
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">Share your experience with this product</p>

                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    {/* Star rating input */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Your Rating <span className="text-[#e8508a]">*</span>
                      </label>
                      <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                      {reviewErrors.rating && (
                        <p className="text-xs text-red-500 mt-1">{reviewErrors.rating}</p>
                      )}
                    </div>

                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1.5 block">
                          Your Name <span className="text-[#e8508a]">*</span>
                        </label>
                        <input
                          type="text"
                          value={reviewName}
                          onChange={e => { setReviewName(e.target.value); setReviewErrors(prev => ({ ...prev, name: '' })); }}
                          placeholder="e.g. Ayesha"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8508a]/30 focus:border-[#e8508a] transition-all"
                        />
                        {reviewErrors.name && (
                          <p className="text-xs text-red-500 mt-1">{reviewErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1.5 block">
                          Email <span className="text-[#e8508a]">*</span>
                          <span className="text-xs text-muted-foreground font-normal ml-1">(not displayed)</span>
                        </label>
                        <input
                          type="email"
                          value={reviewEmail}
                          onChange={e => { setReviewEmail(e.target.value); setReviewErrors(prev => ({ ...prev, email: '' })); }}
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8508a]/30 focus:border-[#e8508a] transition-all"
                        />
                        {reviewErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{reviewErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Review text */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        Your Review <span className="text-[#e8508a]">*</span>
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={e => { setReviewText(e.target.value); setReviewErrors(prev => ({ ...prev, text: '' })); }}
                        placeholder="Tell us what you think about this product... (min. 20 characters)"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8508a]/30 focus:border-[#e8508a] transition-all resize-none"
                      />
                      <div className="flex justify-between mt-1">
                        {reviewErrors.text ? (
                          <p className="text-xs text-red-500">{reviewErrors.text}</p>
                        ) : <span />}
                        <span className={`text-xs ${reviewText.trim().length >= 20 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {reviewText.trim().length}/20
                        </span>
                      </div>
                    </div>

                    {/* Image upload */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        📸 Add a Photo <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {reviewImage ? (
                        <div className="relative inline-block">
                          <img src={reviewImage} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-[#e8508a]/30" />
                          <button
                            type="button"
                            onClick={() => { setReviewImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-[#e8508a]/40 hover:text-[#e8508a] transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Upload Image
                        </button>
                      )}
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2.5 px-8 py-3 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#e8508a] to-[#c964cf] hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Submit Review
                    </motion.button>
                  </form>
                </div>

                {/* ── Review List ── */}
                <div className="space-y-5">
                  {allReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-xl border border-border bg-accent/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8508a] to-[#c964cf] flex items-center justify-center text-white text-sm font-bold">
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                      {review.image && (
                        <img
                          src={review.image}
                          alt="Review"
                          className="mt-3 w-32 h-32 object-cover rounded-xl border border-border"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-pacifico text-center mb-8 bg-gradient-to-r from-[#d94f8a] via-[#b05cc5] to-[#6fa8dc] bg-clip-text text-transparent">
              More in {typeof product.category === 'object' ? product.category.name : product.category} 🌸
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          </motion.section>
        )}

        {/* ── You May Also Like ── */}
        {youMayLike.length > 0 && (
          <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-pacifico text-center mb-8 bg-gradient-to-r from-[#e8508a] via-[#c964cf] to-[#6fa8dc] bg-clip-text text-transparent">
              You May Also Like ✨
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {youMayLike.map(p => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          </motion.section>
        )}
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
