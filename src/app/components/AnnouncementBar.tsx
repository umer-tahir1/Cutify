import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const announcements = [
  '💖 Sending kawaii love worldwide this Valentine\'s 🌸',
  '✨ Free Shipping on orders above 3000 PKR ✨',
  '🎀 New arrivals every week — stay tuned! 🎀',
];

export const AnnouncementBar: React.FC = () => {
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((p) => (p + 1) % announcements.length), []);
  const prev = useCallback(() => setIdx((p) => (p - 1 + announcements.length) % announcements.length), []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="bg-[#2d2d2d] text-white py-2.5 px-4 overflow-hidden relative">
      <div className="container mx-auto flex items-center justify-center">
        <button onClick={prev} className="absolute left-4 sm:left-8 text-white/60 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-sm font-medium tracking-wide"
          >
            {announcements[idx]}
          </motion.p>
        </AnimatePresence>

        <button onClick={next} className="absolute right-4 sm:right-8 text-white/60 hover:text-white transition-colors cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
