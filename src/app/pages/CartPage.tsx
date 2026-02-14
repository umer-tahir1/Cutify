import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from '../components/OptimizedImage';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    discountCode,
    setDiscountCode,
    discountAmount,
  } = useApp();
  const navigate = useNavigate();

  const finalTotal = cartTotal - discountAmount;
  const freeShipping = finalTotal >= 200;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <>
        <FloatingFlowers />
        <Header />
        <main className="container mx-auto px-4 py-16 relative z-10 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-3xl font-pacifico mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding some cute items to your cart! 💖
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <StoreRating />
        <Footer />
      </>
    );
  }

  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-pacifico text-center mb-8">
          Shopping Cart 🛒
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md flex gap-4"
              >
                {/* Image */}
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl"
                  srcSetWidths={[96, 192]}
                  sizes="96px"
                  quality={70}
                />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.salePrice || item.price} PKR
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="font-semibold">
                    {(item.salePrice || item.price) * item.quantity} PKR
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              {/* Discount Code */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="CUTIFY10"
                    className="flex-1 px-3 py-2 rounded-lg bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {discountAmount > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Discount applied!
                  </p>
                )}
              </div>

              {/* Shipping Info */}
              {!freeShipping && (
                <div className="mb-4 p-3 bg-accent/30 rounded-lg text-sm">
                  <p>
                    Add <strong>{200 - finalTotal} PKR</strong> more for free
                    shipping! 🚚
                  </p>
                </div>
              )}

              {freeShipping && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm text-green-700 dark:text-green-300">
                  <p>✓ You've got free shipping! 🎉</p>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 mb-4 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{cartTotal} PKR</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{discountAmount.toFixed(0)} PKR</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{freeShipping ? 'FREE' : '150 PKR'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>
                    {freeShipping ? finalTotal : finalTotal + 150} PKR
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full hover:shadow-lg transition-all font-semibold"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-sm text-muted-foreground hover:text-primary mt-4 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
