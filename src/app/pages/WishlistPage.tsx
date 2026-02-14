import React from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist } = useApp();

  if (wishlist.length === 0) {
    return (
      <>
        <FloatingFlowers />
        <Header />
        <main className="container mx-auto px-4 py-16 relative z-10 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-3xl font-pacifico mb-4">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite items here! 💖
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
          My Wishlist 💖
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
