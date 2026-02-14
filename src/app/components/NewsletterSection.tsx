import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success('Subscribed successfully! 🎉');
    setEmail('');
  };

  return (
    <section className="py-14 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-8 sm:p-14 text-center"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-6 left-[10%] text-4xl">✦</div>
          <div className="absolute top-10 right-[15%] text-3xl">💗</div>
          <div className="absolute bottom-8 left-[20%] text-3xl">✨</div>
          <div className="absolute bottom-6 right-[10%] text-4xl">⭐</div>
          <div className="absolute top-1/2 left-[5%] text-2xl">💖</div>
          <div className="absolute top-1/3 right-[8%] text-2xl">🌟</div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Subscribe To Our Newsletter
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mb-8">
            Get the latest updates on new products and upcoming sales
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email address"
              className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#e8508a] focus:ring-2 focus:ring-[#e8508a]/30 transition-all"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Subscribing...' : 'Subscribe'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};
