import React, { useState } from 'react';
import { Package, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingButtons: React.FC = () => {
  const [showTracking, setShowTracking] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
        {/* Order Tracking */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTracking(!showTracking)}
          className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
          title="Track Order"
        >
          <Package className="w-6 h-6" />
        </motion.button>

        {/* Support */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSupport(!showSupport)}
          className="bg-gradient-to-r from-secondary to-primary text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
          title="Quick Support"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Order Tracking Modal */}
      <AnimatePresence>
        {showTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTracking(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-pacifico mb-4 text-center">
                Track Your Order
              </h3>
              <input
                type="text"
                placeholder="Enter order number..."
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />
              <button className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl hover:shadow-lg transition-all">
                Track Order
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-pacifico mb-4 text-center">
                Quick Support 💬
              </h3>
              <p className="text-center mb-4">
                Need help? We're here for you!
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@cutify.com"
                  className="block w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl hover:shadow-lg transition-all text-center"
                >
                  Email Us
                </a>
                <a
                  href="tel:+92123456789"
                  className="block w-full bg-gradient-to-r from-secondary to-primary text-white py-3 rounded-xl hover:shadow-lg transition-all text-center"
                >
                  Call Us
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
