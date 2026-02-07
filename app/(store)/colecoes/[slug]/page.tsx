'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Collection, Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: col } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (col) {
        setCollection(col);
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('collection_id', col.id)
          .order('created_at', { ascending: false });
        if (prods) setProducts(prods as Product[]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-6 h-6 border border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-40">
        <h1 className="text-2xl font-serif text-charcoal/40">Colecao nao encontrada</h1>
      </div>
    );
  }

  return (
    <>
      <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden bg-charcoal">
        <img
          src={collection.image_url}
          alt={collection.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">COLECAO</p>
            <h1 className="text-4xl lg:text-5xl font-serif text-ivory font-light mb-3">{collection.name}</h1>
            <p className="text-[14px] font-sans text-ivory/50 max-w-lg">{collection.description}</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <p className="text-[12px] font-sans text-charcoal/40 mb-10">
          {products.length} {products.length === 1 ? 'produto' : 'produtos'}
        </p>
        {products.length === 0 ? (
          <p className="text-center text-lg font-serif text-charcoal/30 py-20">Em breve</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
