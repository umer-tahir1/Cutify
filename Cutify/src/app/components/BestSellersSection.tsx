import React, { useEffect, useState } from 'react';
import { Product, normalizeProduct } from '../data/mockData';
import { ProductCard } from './ProductCard';
import api from '../api/client';

export const BestSellersSection: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    api.getBestSellers().then((res) => {
      const products = (res.data?.products || res.data || []).map(normalizeProduct);
      setBestSellers(products);
    }).catch(() => {});
  }, []);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-16">
      <h2 className="text-4xl text-center font-pacifico mb-12 bg-gradient-to-r from-[#e8508a] via-[#c964cf] to-[#6fa8dc] bg-clip-text text-transparent drop-shadow-sm">
        Best Sellers 💖
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
        {bestSellers.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};
