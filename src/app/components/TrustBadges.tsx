import React from 'react';
import { motion } from 'motion/react';
import { Truck, RotateCcw, Gift } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Enjoy free shipping on all orders — shop now!',
    color: '#e8508a',
  },
  {
    icon: RotateCcw,
    title: 'Easy Free Returns',
    description: 'Shop with confidence: easy and free returns!',
    color: '#c964cf',
  },
  {
    icon: Gift,
    title: 'Free Gift with Purchase',
    description: 'Get a free gift with every purchase over 3,000 PKR!',
    color: '#6fa8dc',
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-14 sm:py-20">
      <h2 className="text-3xl sm:text-4xl text-center font-pacifico mb-10 sm:mb-14 bg-gradient-to-r from-[#e8508a] via-[#c964cf] to-[#6fa8dc] bg-clip-text text-transparent drop-shadow-sm">
        Why Cutify? 💖
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${badge.color}15` }}
            >
              <badge.icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: badge.color }} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">{badge.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{badge.description}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">*Terms & conditions applied</p>
    </section>
  );
};
