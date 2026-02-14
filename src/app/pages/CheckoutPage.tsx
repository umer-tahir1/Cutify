import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedImage } from '../components/OptimizedImage';

type Step = 'shipping' | 'payment' | 'confirmation';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, discountAmount, clearCart } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  const finalTotal = cartTotal - discountAmount;
  const freeShipping = finalTotal >= 200;
  const grandTotal = freeShipping ? finalTotal : finalTotal + 150;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !shippingInfo.name ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate order number
    const orderNum = `CUT${Date.now().toString().slice(-8)}`;
    setOrderNumber(orderNum);
    setStep('confirmation');
    clearCart();
    toast.success('Order placed successfully! 🎉');
  };

  if (step === 'confirmation') {
    return (
      <>
        <FloatingFlowers />
        <Header />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-pacifico mb-4">Order Confirmed! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for shopping with Cutify! Your order has been placed
              successfully.
            </p>

            <div className="bg-accent/30 rounded-2xl p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="text-2xl font-semibold mb-4">{orderNumber}</p>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{cartTotal} PKR</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{discountAmount.toFixed(0)} PKR</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{freeShipping ? 'FREE' : '150 PKR'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{grandTotal} PKR</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              A confirmation email has been sent to{' '}
              <strong>{shippingInfo.email}</strong>
            </p>

            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Continue Shopping
            </button>
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
        <h1 className="text-4xl font-pacifico text-center mb-8">Checkout ✨</h1>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step === 'shipping' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'shipping'
                    ? 'bg-primary text-white'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline">Shipping</span>
            </div>

            <div className="w-16 h-0.5 bg-border" />

            <div
              className={`flex items-center gap-2 ${
                step === 'payment' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'payment'
                    ? 'bg-primary text-white'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>

            <div className="w-16 h-0.5 bg-border" />

            <div
              className={`flex items-center gap-2 ${
                step === 'confirmation'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'confirmation'
                    ? 'bg-primary text-white'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form
                onSubmit={handleShippingSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Email *</label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full hover:shadow-lg transition-all font-semibold"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form
                onSubmit={handlePaymentSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
              >
                <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod('cod')}
                      className="w-5 h-5 text-primary"
                    />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod('card')}
                      className="w-5 h-5 text-primary"
                    />
                    <div>
                      <p className="font-semibold">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">
                        Secure payment via card
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6 p-4 bg-accent/30 rounded-xl">
                    <div>
                      <label className="block text-sm mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="flex-1 border-2 border-border py-3 rounded-full hover:bg-accent transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full hover:shadow-lg transition-all font-semibold"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      srcSetWidths={[64, 128]}
                      sizes="64px"
                      quality={70}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(item.salePrice || item.price) * item.quantity} PKR
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
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
                  <span>{grandTotal} PKR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
