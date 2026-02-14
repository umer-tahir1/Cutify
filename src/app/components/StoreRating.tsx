import React from 'react';
import { Star } from 'lucide-react';

export const StoreRating: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Laurel + Rating */}
        <div className="relative flex items-center justify-center">
          {/* Left Laurel */}
          <svg
            className="w-20 h-24 sm:w-24 sm:h-28 text-gray-300 absolute -left-16 sm:-left-20 top-1/2 -translate-y-1/2"
            viewBox="0 0 80 100"
            fill="currentColor"
          >
            <path d="M60 10c-8 4-14 12-16 22-4-8-12-14-22-14 10 4 16 14 16 24-6-6-16-10-26-8 12 2 22 10 24 22-8-8-20-12-30-8 14 2 26 12 28 26-6-10-18-16-30-16 14 4 24 16 26 30-4-8-12-16-22-20 12 6 20 18 22 32" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
          </svg>

          {/* Right Laurel (mirrored) */}
          <svg
            className="w-20 h-24 sm:w-24 sm:h-28 text-gray-300 absolute -right-16 sm:-right-20 top-1/2 -translate-y-1/2 scale-x-[-1]"
            viewBox="0 0 80 100"
            fill="currentColor"
          >
            <path d="M60 10c-8 4-14 12-16 22-4-8-12-14-22-14 10 4 16 14 16 24-6-6-16-10-26-8 12 2 22 10 24 22-8-8-20-12-30-8 14 2 26 12 28 26-6-10-18-16-30-16 14 4 24 16 26 30-4-8-12-16-22-20 12 6 20 18 22 32" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
          </svg>

          <div className="flex flex-col items-center px-10 sm:px-14">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#4a5568] uppercase mb-1">
              Average Store Rating
            </p>
            <span className="text-5xl sm:text-6xl font-bold text-[#4a5568] leading-tight">
              4.9
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Certified reviews */}
        <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#4a5568] mt-2">
          202.6K <span className="text-green-500">✅</span> CERTIFIED REVIEWS
        </p>
      </div>
    </section>
  );
};
