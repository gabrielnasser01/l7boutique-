'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Collection } from '@/lib/types';

export function CollectionsBanner() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('is_featured', true)
        .order('sort_order')
        .limit(3);
      if (data) setCollections(data);
    }
    load();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 border-t border-charcoal/8">
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Explorar</p>
        <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Colecoes</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <Link href={`/colecoes/${col.slug}`} className="group block relative overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden bg-charcoal/5">
                <img
                  src={col.image_url}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-[9px] tracking-wide-boutique font-sans text-gold mb-2 uppercase">COLECAO</p>
                <h3 className="text-xl font-serif text-ivory mb-3">{col.name}</h3>
                <span className="inline-flex items-center gap-2 text-[10px] tracking-boutique font-sans text-ivory/60 group-hover:text-ivory transition-colors uppercase">
                  EXPLORAR
                  <ArrowRight size={12} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
