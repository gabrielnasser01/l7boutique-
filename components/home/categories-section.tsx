'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (data) setCategories(data);
    }
    load();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Curadoria</p>
        <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Categorias</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link href={`/loja?categoria=${cat.slug}`} className="group block relative overflow-hidden">
              <div className="aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-charcoal/5">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                <h3 className="text-[11px] tracking-boutique font-sans text-ivory uppercase">
                  {cat.name}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
