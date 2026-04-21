import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OptimizedImage } from './OptimizedImage';

export const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity, cartTotal, cartCount } = useApp();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white shadow-2xl z-[9991] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#e8508a]" />
                <h2 className="text-lg font-bold text-gray-800">Your Cart</h2>
                <span className="bg-[#e8508a] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add cute items to get started! 🎀</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white text-sm font-semibold hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 bg-gray-50 rounded-xl p-3"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                        <OptimizedImage src={item.image} alt={item.name} className="w-full h-full object-cover" srcSetWidths={[80, 160]} sizes="80px" quality={70} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                        <p className="text-sm font-bold text-[#e8508a] mt-0.5">
                          {item.salePrice || item.price} PKR
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-lg font-bold text-gray-800">{cartTotal.toLocaleString()} PKR</span>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1 py-2.5 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold text-center hover:bg-gray-100 transition-colors"
                  >
                    View Cart
                  </a>
                  <a
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white text-sm font-semibold text-center hover:shadow-lg transition-shadow"
                  >
                    Checkout
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
