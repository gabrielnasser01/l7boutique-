'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FaqItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqSection() {
  const [items, setItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order')
        .limit(5);
      if (data) setItems(data);
    }
    load();
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 border-t border-charcoal/8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Duvidas</p>
          <h2 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Perguntas Frequentes</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-0">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-charcoal/8 py-1">
              <AccordionTrigger className="text-left text-[15px] font-serif text-charcoal hover:text-gold transition-colors py-5 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] font-sans text-charcoal/60 leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
          >
            Ver Todas as Perguntas
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
