'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';

interface SearchOverlayProps {
  onClose: () => void;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`)
        .limit(6);
      setResults((data as Product[]) || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] bg-ivory/98 backdrop-blur-sm"
    >
      <div className="max-w-2xl mx-auto px-6 pt-20 lg:pt-32">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal/50 uppercase">Buscar</h2>
          <button onClick={onClose} className="p-1 text-charcoal/60 hover:text-charcoal transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-charcoal/20 pb-3 mb-8">
          <Search size={18} strokeWidth={1.5} className="text-charcoal/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que voce procura?"
            className="flex-1 bg-transparent text-lg font-serif text-charcoal placeholder:text-charcoal/30 outline-none"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border border-gold/40 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 p-3 hover:bg-charcoal/3 transition-colors group"
              >
                <div className="w-16 h-20 bg-charcoal/5 flex-shrink-0 overflow-hidden">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif text-charcoal truncate">{product.name}</p>
                  <p className="text-xs font-sans text-gold mt-1">{formatPrice(product.price)}</p>
                </div>
                <ArrowRight size={14} strokeWidth={1.5} className="text-charcoal/20 group-hover:text-gold transition-colors" />
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="text-center text-sm font-sans text-charcoal/40 py-8">
            Nenhum resultado para &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
}
