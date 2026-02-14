import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { Heart, Package, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-pacifico text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About Cutify 💖
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg mb-8">
            <p className="text-lg leading-relaxed mb-6">
              Welcome to <strong>Cutify</strong> – your ultimate destination for
              all things cute, aesthetic, and trendy! We're passionate about
              bringing joy and style to your everyday life with our carefully
              curated collection of adorable products.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              From kawaii accessories to dreamy home decor, every item in our
              store is handpicked to add a touch of sweetness to your world. We
              believe that life should be filled with beautiful things that make
              you smile! ✨
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-sm text-muted-foreground">
                We ensure every product meets our high standards of cuteness and
                quality
              </p>
            </div>

            <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Quick delivery right to your doorstep with care and love
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-200 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/5 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unique Designs</h3>
              <p className="text-sm text-muted-foreground">
                Exclusive and trendy items you won't find anywhere else
              </p>
            </div>
          </div>
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
