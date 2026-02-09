'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Collection } from '@/lib/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order');
      if (data) setCollections(data);
    }
    load();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 lg:mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Explorar</p>
        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Coleções</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link href={`/colecoes/${col.slug}`} className="group block relative overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-charcoal/5">
                <img
                  src={col.image_url}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-10">
                <p className="text-[9px] tracking-wide-boutique font-sans text-gold mb-2 uppercase">COLEÇÃO</p>
                <h2 className="text-2xl lg:text-3xl font-serif text-ivory mb-2">{col.name}</h2>
                <p className="text-[13px] font-sans text-ivory/50 mb-4 max-w-sm">{col.description}</p>
                <span className="inline-flex items-center gap-2 text-[10px] tracking-boutique font-sans text-ivory/60 group-hover:text-ivory transition-colors uppercase">
                  EXPLORAR
                  <ArrowRight size={12} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
