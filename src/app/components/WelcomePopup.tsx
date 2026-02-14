import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'cutify-welcome-shown';

export const WelcomePopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(STORAGE_KEY);
    if (!shown) {
      // Slight delay so the page loads first
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    // Simulate subscribe
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("You're subscribed! Check your email for 10% off 🎉");
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-[820px] w-full flex flex-col sm:flex-row">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left — Image Side */}
              <div className="sm:w-[48%] relative overflow-hidden bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5]">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=750&fit=crop"
                  alt="Cutify Products"
                  className="w-full h-48 sm:h-full object-cover"
                />
                {/* Overlay text on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5 sm:p-7">
                  <p
                    className="font-pacifico text-white text-lg sm:text-xl leading-snug drop-shadow-lg"
                  >
                    Cutify
                  </p>
                  <h3 className="text-white font-extrabold text-2xl sm:text-3xl mt-1 leading-tight drop-shadow-lg tracking-wide">
                    WELCOME!
                  </h3>
                  <p className="text-white font-black text-3xl sm:text-4xl mt-1 drop-shadow-lg" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                    10% OFF
                  </p>
                  <p className="text-white/90 font-bold text-sm sm:text-base mt-0.5 drop-shadow">
                    YOUR FIRST ORDER
                  </p>
                </div>
              </div>

              {/* Right — Content Side */}
              <div className="sm:w-[52%] flex flex-col items-center justify-center px-6 sm:px-10 py-8 sm:py-10 text-center">
                {/* Sparkle */}
                <span className="text-2xl mb-2">✨</span>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">
                  WELCOME TO<br />
                  <span className="font-pacifico bg-gradient-to-r from-[#e8508a] to-[#c964cf] bg-clip-text text-transparent text-2xl sm:text-3xl">
                    Cutify
                  </span>
                </h2>

                <p className="text-gray-500 text-sm sm:text-[15px] mt-4 leading-relaxed max-w-[280px]">
                  <span className="font-semibold text-gray-700">LIMITED TIME OFFER :</span>{' '}
                  Subscribe now and get an additional{' '}
                  <span className="font-semibold text-[#e8508a]">10% Discount</span> code on your email.
                </p>

                <form onSubmit={handleSubmit} className="w-full max-w-[300px] mt-6 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter your email address"
                    className="w-full px-5 py-2.5 rounded-full border border-gray-300 text-sm text-center focus:outline-none focus:border-[#e8508a] focus:ring-2 focus:ring-[#e8508a]/20 transition-all placeholder:text-gray-400"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-full border-2 border-gray-800 text-gray-800 font-semibold text-sm hover:bg-gray-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Subscribing...' : 'Submit'}
                  </motion.button>
                </form>

                {/* Social icons */}
                <div className="flex items-center gap-5 mt-6">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#e8508a] transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#e8508a] transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#e8508a] transition-colors"
                  >
                    {/* Pinterest icon (lucide doesn't have it, using SVG) */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
