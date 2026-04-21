import React from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  return (
    <section className="py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#fce4ec] via-[#f3e5f5] to-[#e8eaf6] p-8 sm:p-12 text-center"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#e8508a]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#c964cf]/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#e8508a] to-[#c964cf] flex items-center justify-center shadow-lg shadow-[#e8508a]/20"
          >
            <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Free 5 Products! 🎁
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            5 exciting random products <span className="font-semibold text-[#e8508a]">totally free</span> on
            orders above <span className="font-bold text-gray-800">3,000 PKR</span>. This bundle is a giveaway —
            all 5 random products will be added to your cart automatically once your cart reaches 3,000 PKR.
            Simply shop and see the magic! ✨
          </p>

          <p className="mt-4 text-xs text-gray-400">*Terms & conditions apply</p>
        </div>
      </motion.div>
    </section>
  );
};
