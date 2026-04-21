import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Product, normalizeProduct } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';
import api from '../api/client';

export const NewArrivalsSection: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts({ sort: '-createdAt', limit: '4' }).then((res) => {
      const products = (res.data?.products || res.data || []).map(normalizeProduct);
      setNewArrivals(products);
    }).catch(() => {});
  }, []);

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-14 sm:py-20">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl sm:text-4xl font-pacifico bg-gradient-to-r from-[#e8508a] via-[#c964cf] to-[#6fa8dc] bg-clip-text text-transparent drop-shadow-sm">
          New Arrivals ✨
        </h2>
        <Link
          to="/collections/new-arrivals"
          className="text-sm font-semibold text-[#e8508a] hover:underline flex items-center gap-1"
        >
          👀 View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {newArrivals.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
