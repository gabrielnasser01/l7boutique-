'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FaqItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CATEGORY_LABELS: Record<string, string> = {
  envio: 'Envio e Entregas',
  trocas: 'Trocas e Devolucoes',
  produtos: 'Produtos',
  pagamento: 'Pagamento',
  geral: 'Geral',
};

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order');
      if (data) setItems(data);
    }
    load();
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filteredItems = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Ajuda</p>
          <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Perguntas Frequentes</h1>
          <p className="text-[13px] font-sans text-charcoal/40 mt-4 max-w-md mx-auto">
            Encontre respostas para as duvidas mais comuns sobre nossos produtos, envio e politicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-[10px] tracking-boutique font-sans px-4 py-2 border uppercase transition-colors ${
              !activeCategory ? 'border-charcoal bg-charcoal text-ivory' : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40'
            }`}
          >
            TODOS
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] tracking-boutique font-sans px-4 py-2 border uppercase transition-colors ${
                activeCategory === cat ? 'border-charcoal bg-charcoal text-ivory' : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-0">
          {filteredItems.map((item) => (
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

        <div className="mt-16 text-center border border-charcoal/8 p-10">
          <h3 className="text-xl font-serif text-charcoal mb-3">Ainda tem duvidas?</h3>
          <p className="text-[13px] font-sans text-charcoal/40 mb-6">
            Nossa equipe esta pronta para ajudar voce.
          </p>
          <a
            href="mailto:contato@l7boutique.com"
            className="inline-block text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-8 py-3 uppercase hover:bg-charcoal hover:text-ivory transition-colors duration-300"
          >
            FALE CONOSCO
          </a>
        </div>
      </motion.div>
    </div>
  );
}
