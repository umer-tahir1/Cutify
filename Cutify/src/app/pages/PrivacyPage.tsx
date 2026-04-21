import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';

export const PrivacyPage: React.FC = () => {
  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
          <h1 className="text-4xl font-pacifico text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Privacy Policy 🔒
          </h1>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when
                you create an account, make a purchase, or contact us. This may
                include your name, email address, shipping address, and payment
                information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground">
                We use the information we collect to process orders, communicate
                with you, improve our services, and personalize your shopping
                experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your
                personal information. However, no method of transmission over the
                internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing
                experience and analyze site traffic.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Third Parties</h2>
              <p className="text-muted-foreground">
                We do not sell or share your personal information with third
                parties for their marketing purposes without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please
                contact us at support@cutify.com.
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
