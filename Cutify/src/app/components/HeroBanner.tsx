import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface Slide {
  id: number;
  bg: string;
  heading: string;
  subHeading: string;
  cta: string;
  href: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    bg: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&h=600&fit=crop',
    heading: 'Spruce Up Your Desk\nWith Kawaii Finds',
    subHeading: 'Discover the cutest stationery & accessories ✨',
    cta: 'Shop Now',
    href: '/',
    gradient: 'from-pink-200/90 via-pink-100/70 to-transparent',
  },
  {
    id: 2,
    bg: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1400&h=600&fit=crop',
    heading: 'New Arrivals Are\nHere! 🎀',
    subHeading: 'Pastel accessories that make you smile',
    cta: 'Explore',
    href: '/',
    gradient: 'from-purple-200/90 via-purple-100/70 to-transparent',
  },
  {
    id: 3,
    bg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=600&fit=crop',
    heading: "Up to 50% Off\nValentine's Sale 💖",
    subHeading: 'Grab the cutest gifts for your loved ones',
    cta: 'Shop Sale',
    href: '/',
    gradient: 'from-rose-200/90 via-rose-100/70 to-transparent',
  },
];

const AUTOPLAY_MS = 5000;

export const HeroBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <img
              src={slide.bg}
              alt=""
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

            {/* Kawaii decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Hearts */}
              <svg className="absolute top-8 right-12 w-16 h-16 text-pink-400 opacity-60 hidden md:block" viewBox="0 0 60 60" fill="currentColor">
                <path d="M30 54 C30 54 4 36 4 18 C4 8 12 2 20 2 C25 2 28 5 30 8 C32 5 35 2 40 2 C48 2 56 8 56 18 C56 36 30 54 30 54Z"/>
              </svg>
              <svg className="absolute bottom-16 right-1/4 w-12 h-12 text-rose-300 opacity-50 hidden md:block" viewBox="0 0 60 60" fill="currentColor">
                <path d="M30 54 C30 54 4 36 4 18 C4 8 12 2 20 2 C25 2 28 5 30 8 C32 5 35 2 40 2 C48 2 56 8 56 18 C56 36 30 54 30 54Z"/>
              </svg>
              {/* Stars */}
              <svg className="absolute top-20 right-1/3 w-10 h-10 text-white opacity-80 hidden lg:block" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z"/>
              </svg>
              <svg className="absolute bottom-24 left-[55%] w-8 h-8 text-yellow-200 opacity-70 hidden lg:block" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z"/>
              </svg>
            </div>

            {/* Text Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6 sm:px-10 lg:px-16">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-lg"
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight whitespace-pre-line drop-shadow-sm">
                    {slide.heading}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 mt-3 sm:mt-4 font-medium">
                    {slide.subHeading}
                  </p>
                  <Link
                    to={slide.href}
                    className="inline-block mt-5 sm:mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-pink-300/40 transition-all"
                  >
                    {slide.cta}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left / Right arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-[#e8508a] transition-all cursor-pointer z-10"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-[#e8508a] transition-all cursor-pointer z-10"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all cursor-pointer ${
              i === current
                ? 'w-8 h-3 bg-[#e8508a]'
                : 'w-3 h-3 bg-white/70 hover:bg-white border border-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
