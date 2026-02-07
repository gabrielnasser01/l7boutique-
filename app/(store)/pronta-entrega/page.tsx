'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export default function ProntaEntregaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*), collections(*)')
        .eq('pronta_entrega', true);
      if (data) setProducts(data as Product[]);
      setLoading(false);
    }
    load();
  }, []);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [products, sortBy]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 lg:mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Disponivel agora</p>
        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Pronta Entrega</h1>
        <p className="text-[13px] font-sans text-charcoal/50 mt-3 max-w-lg leading-relaxed">
          Pecas selecionadas disponiveis para envio imediato. Receba em poucos dias uteis.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-charcoal/8">
        <span className="text-[12px] font-sans text-charcoal/40">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'produto' : 'produtos'}
        </span>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-[11px] tracking-boutique font-sans text-charcoal/60 bg-transparent border border-charcoal/15 px-4 py-2 uppercase appearance-none cursor-pointer outline-none"
        >
          <option value="newest">MAIS RECENTES</option>
          <option value="price-asc">MENOR PRECO</option>
          <option value="price-desc">MAIOR PRECO</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-charcoal/5" />
              <div className="pt-4 space-y-2">
                <div className="h-4 bg-charcoal/5 w-3/4" />
                <div className="h-3 bg-charcoal/5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-serif text-charcoal/40 mb-2">Nenhum produto disponivel no momento</p>
          <p className="text-[13px] font-sans text-charcoal/30">Volte em breve para novidades</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
        >
          {sortedProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
