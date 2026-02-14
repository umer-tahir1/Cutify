import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';

export const TermsPage: React.FC = () => {
  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
          <h1 className="text-4xl font-pacifico text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Terms & Conditions 📋
          </h1>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Cutify, you accept and agree to be bound by
                these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
              <p className="text-muted-foreground">
                You agree to use our service only for lawful purposes and in
                accordance with these Terms. You may not use our service in any way
                that could damage or impair the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Account Responsibility</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your
                account and password. You agree to accept responsibility for all
                activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Product Information</h2>
              <p className="text-muted-foreground">
                We strive to provide accurate product descriptions and images.
                However, we do not guarantee that product descriptions or other
                content is error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Pricing</h2>
              <p className="text-muted-foreground">
                All prices are listed in PKR and are subject to change without
                notice. We reserve the right to modify or discontinue products at
                any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this site, including text, graphics, logos, and
                images, is the property of Cutify and protected by copyright laws.
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
