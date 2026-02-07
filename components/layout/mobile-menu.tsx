'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight, ChevronLeft, Search, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileMenuProps {
  onClose: () => void;
}

interface MenuSection {
  label: string;
  items: { href: string; label: string }[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'CATEGORIAS',
    items: [
      { href: '/loja?categoria=tenis', label: 'Tenis' },
      { href: '/loja?categoria=casacos', label: 'Casacos' },
      { href: '/loja?categoria=tricos', label: 'Tricos' },
      { href: '/loja?categoria=alfaiataria', label: 'Alfaiataria' },
      { href: '/loja?categoria=camisas', label: 'Camisas' },
      { href: '/loja?categoria=calcas', label: 'Calcas' },
      { href: '/loja?categoria=acessorios', label: 'Acessorios' },
    ],
  },
  {
    label: 'MARCAS',
    items: [
      { href: '/loja?marca=hermes', label: 'Hermes' },
      { href: '/loja?marca=louis-vuitton', label: 'Louis Vuitton' },
      { href: '/loja?marca=gucci', label: 'Gucci' },
      { href: '/loja?marca=golden-goose', label: 'Golden Goose' },
    ],
  },
  {
    label: 'COLECOES',
    items: [
      { href: '/colecoes/inverno-2025', label: 'Inverno 2025' },
      { href: '/colecoes/alfaiataria', label: 'Alfaiataria' },
      { href: '/colecoes/essenciais', label: 'Essenciais' },
      { href: '/colecoes/outerwear', label: 'Outerwear' },
    ],
  },
];

const QUICK_LINKS = [
  { href: '/conta', label: 'Minha Conta', icon: User },
  { href: '/rastreio', label: 'Rastrear Pedido', icon: Package },
];

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [activeSection, setActiveSection] = useState<MenuSection | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] bg-ivory"
    >
      <div className="flex items-center justify-between px-6 h-16 border-b border-charcoal/10">
        <Link href="/" onClick={onClose} className="flex flex-col items-center">
          <span className="text-2xl font-serif font-semibold text-charcoal leading-none">L7</span>
          <span className="text-[7px] tracking-wide-boutique font-sans text-charcoal/60 uppercase">Boutique</span>
        </Link>
        <button onClick={onClose} className="p-1 text-charcoal" aria-label="Fechar">
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        {!activeSection ? (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="px-6 py-8"
          >
            <div className="space-y-2 mb-10">
              <Link
                href="/loja"
                onClick={onClose}
                className="flex items-center justify-between py-4 border-b border-charcoal/8 text-[13px] tracking-boutique font-sans text-charcoal uppercase"
              >
                LOJA
                <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal/40" />
              </Link>
              <Link
                href="/pronta-entrega"
                onClick={onClose}
                className="flex items-center justify-between py-4 border-b border-charcoal/8 text-[13px] tracking-boutique font-sans text-charcoal uppercase"
              >
                PRONTA ENTREGA
                <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal/40" />
              </Link>
              {MENU_SECTIONS.map((section) => (
                <button
                  key={section.label}
                  onClick={() => setActiveSection(section)}
                  className="flex items-center justify-between w-full py-4 border-b border-charcoal/8 text-[13px] tracking-boutique font-sans text-charcoal uppercase"
                >
                  {section.label}
                  <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal/40" />
                </button>
              ))}
              <Link
                href="/faq"
                onClick={onClose}
                className="flex items-center justify-between py-4 border-b border-charcoal/8 text-[13px] tracking-boutique font-sans text-charcoal uppercase"
              >
                FAQ
                <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal/40" />
              </Link>
            </div>

            <div className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 text-[12px] tracking-boutique font-sans text-charcoal/60 uppercase"
                >
                  <link.icon size={16} strokeWidth={1.5} />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="px-6 py-8"
          >
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 mb-8 text-[11px] tracking-boutique font-sans text-charcoal/50 uppercase"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              VOLTAR
            </button>

            <h3 className="text-[11px] tracking-wide-boutique font-sans text-gold mb-6 uppercase">
              {activeSection.label}
            </h3>

            <div className="space-y-1">
              {activeSection.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block py-3 border-b border-charcoal/8 text-[13px] tracking-boutique font-sans text-charcoal uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
