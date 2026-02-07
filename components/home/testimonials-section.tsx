'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/lib/types';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
      if (data) setTestimonials(data);
    }
    load();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 border-t border-charcoal/8">
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Clientes</p>
        <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Depoimentos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border border-charcoal/8 p-8"
          >
            <Quote size={20} strokeWidth={1} className="text-gold/40 mb-4" />
            <p className="text-[15px] font-serif text-charcoal/80 leading-relaxed italic mb-6">
              &ldquo;{t.content}&rdquo;
            </p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={11} className="fill-gold text-gold" />
              ))}
            </div>
            <p className="text-[12px] font-sans text-charcoal font-medium">{t.author_name}</p>
            <p className="text-[11px] font-sans text-charcoal/40">{t.author_location}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
