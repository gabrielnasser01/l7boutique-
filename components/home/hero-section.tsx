'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SiteImage } from '@/lib/types';

const FALLBACK_SLIDES = [
  { image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1600', subtitle: 'HERMES | LOUIS VUITTON | GUCCI', title: 'Luxo\nAutentico', cta: 'Explorar Pecas', href: '/loja' },
  { image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1600', subtitle: 'GOLDEN GOOSE | SNEAKERS', title: 'Tenis\nExclusivos', cta: 'Ver Tenis', href: '/loja?categoria=tenis' },
  { image: 'https://images.pexels.com/photos/6764007/pexels-photo-6764007.jpeg?auto=compress&cs=tinysrgb&w=1600', subtitle: 'CURADORIA DE LUXO', title: 'Elegancia\nSilenciosa', cta: 'Ver Colecao', href: '/colecoes/inverno-2025' },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.from('site_images').select('*').eq('section', 'hero').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setSlides((data as SiteImage[]).map((s) => ({
          image: s.image_url,
          subtitle: s.subtitle,
          title: s.title.replace(' ', '\n'),
          cta: 'Explorar',
          href: s.link_url || '/loja',
        })));
      }
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative h-[75vh] sm:h-[85vh] lg:h-[90vh] overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={mounted ? { opacity: 0, scale: 1.05 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/20" />

      <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-end pb-16 sm:pb-20 lg:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={mounted ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-[9px] sm:text-[10px] tracking-wide-boutique font-sans text-gold mb-3 sm:mb-4">
              {slide.subtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-light text-ivory leading-[1.1] whitespace-pre-line mb-6 sm:mb-8">
              {slide.title}
            </h1>
            <Link
              href={slide.href}
              className="inline-block text-[10px] sm:text-[11px] tracking-boutique font-sans text-ivory border border-ivory/40 px-8 sm:px-10 py-3.5 sm:py-4 uppercase hover:bg-ivory hover:text-charcoal active:scale-[0.97] transition-all duration-500"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 right-4 sm:right-6 lg:right-10 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-ivory/20 flex items-center justify-center text-ivory/60 hover:text-ivory hover:border-ivory/40 active:scale-90 transition-all duration-300"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-ivory/20 flex items-center justify-center text-ivory/60 hover:text-ivory hover:border-ivory/40 active:scale-90 transition-all duration-300"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
          <span className="hidden sm:inline text-[11px] font-sans text-ivory/30 ml-2">
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}
