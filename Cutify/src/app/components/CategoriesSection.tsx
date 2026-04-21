import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Category, normalizeCategory } from '../data/mockData';
import { motion } from 'motion/react';
import api from '../api/client';
import { OptimizedImage } from './OptimizedImage';

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then((res) => {
      const cats = (res.data?.categories || res.data || []).map(normalizeCategory);
      setCategories(cats);
    }).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-14 sm:py-20">
      <h2 className="text-3xl sm:text-4xl text-center font-pacifico mb-10 sm:mb-14 bg-gradient-to-r from-[#d94f8a] via-[#b05cc5] to-[#6fa8dc] bg-clip-text text-transparent drop-shadow-sm">
        🛍️ Shop by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {categories.map((category, i) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link
              to={`/category/${category.slug || category._id}`}
              className="group block rounded-xl sm:rounded-2xl overflow-hidden relative"
            >
              {/* Image — 4:5 portrait ratio like CA Sports cards */}
              <div className="aspect-[4/5] overflow-hidden bg-accent">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  aspectRatio="4/5"
                  srcSetWidths={[200, 400, 600]}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  quality={70}
                  priority={i < 3}
                />
              </div>

              {/* Category name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                <h3 className="text-white font-semibold text-sm sm:text-base">{category.name}</h3>
                <p className="text-white/70 text-xs mt-0.5">{category.productCount} products</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
