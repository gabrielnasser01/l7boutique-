'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setProducts(data as Product[]);
    }
    load();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Pronta Entrega</p>
          <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Disponivel Agora</h2>
        </div>
        <Link
          href="/loja"
          className="hidden lg:flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
        >
          Ver Tudo
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
