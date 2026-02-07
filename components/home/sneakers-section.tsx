'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, SiteImage } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export function SneakersSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<SiteImage | null>(null);

  useEffect(() => {
    async function load() {
      const { data: spotlight } = await supabase
        .from('site_images')
        .select('*')
        .eq('section', 'homepage')
        .eq('image_key', 'category_spotlight')
        .maybeSingle();

      if (!spotlight || !spotlight.link_url) return;
      setConfig(spotlight as SiteImage);

      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', spotlight.link_url)
        .maybeSingle();

      if (!catData) return;

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', catData.id)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) setProducts(data as Product[]);
    }
    load();
  }, []);

  if (!config || !config.link_url || products.length === 0) return null;

  const label = config.title || 'DESTAQUES';
  const title = config.subtitle || 'Produtos';
  const categorySlug = config.link_url;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 border-t border-charcoal/8">
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">{label}</p>
          <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">{title}</h2>
        </div>
        <Link
          href={`/loja?categoria=${categorySlug}`}
          className="hidden lg:flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
        >
          Ver Todos
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="lg:hidden mt-10 text-center">
        <Link
          href={`/loja?categoria=${categorySlug}`}
          className="inline-flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
        >
          Ver Todos
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
