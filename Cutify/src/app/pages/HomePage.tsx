import React from 'react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { CategoriesSection } from '../components/CategoriesSection';
import { PromoBanner } from '../components/PromoBanner';
import { BestSellersSection } from '../components/BestSellersSection';
import { NewArrivalsSection } from '../components/NewArrivalsSection';
import { TrustBadges } from '../components/TrustBadges';
import { ReviewsSection } from '../components/ReviewsSection';
import { NewsletterSection } from '../components/NewsletterSection';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingButtons } from '../components/FloatingButtons';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { WelcomePopup } from '../components/WelcomePopup';
import { FanFavoriteSection } from '../components/FanFavoriteSection';
import { CutifyHero } from '../components/CutifyHero';

export const HomePage: React.FC = () => {
  return (
    <>
      <WelcomePopup />
      <CutifyHero />
      <FloatingFlowers />
      <AnnouncementBar />
      <Header />
      <HeroBanner />
      <main className="container mx-auto px-4 relative z-10">
        <CategoriesSection />
        <PromoBanner />
        <BestSellersSection />
        <FanFavoriteSection />
        <NewArrivalsSection />
        <TrustBadges />
        <ReviewsSection />
        <NewsletterSection />
      </main>
      <StoreRating />
      <Footer />
      <FloatingButtons />
    </>
  );
};
