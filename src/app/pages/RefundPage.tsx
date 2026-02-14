import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';

export const RefundPage: React.FC = () => {
  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
          <h1 className="text-4xl font-pacifico text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Refund Policy 💝
          </h1>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Return Window</h2>
              <p className="text-muted-foreground">
                We accept returns within 7 days of delivery. Items must be unused,
                in original packaging, and in the same condition as received.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Eligible Items</h2>
              <p className="text-muted-foreground">
                Most items are eligible for return except for personalized or
                custom-made products. Sale items may have different return
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Return Process</h2>
              <p className="text-muted-foreground">
                To initiate a return, please contact us at support@cutify.com with
                your order number and reason for return. We'll provide you with
                return instructions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Refund Processing</h2>
              <p className="text-muted-foreground">
                Once we receive and inspect your return, we'll process your refund
                within 5-7 business days. The refund will be issued to your
                original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Shipping Costs</h2>
              <p className="text-muted-foreground">
                Return shipping costs are the responsibility of the customer unless
                the item was damaged or defective upon arrival.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Exchanges</h2>
              <p className="text-muted-foreground">
                We offer exchanges for different sizes or colors of the same item.
                Please contact us to arrange an exchange.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Information</h2>
              <p className="text-muted-foreground">
                For any questions regarding returns or refunds, please email us at
                support@cutify.com or call +92 123 456 789.
              </p>
            </section>
          </div>
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
