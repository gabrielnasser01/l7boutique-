'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/cart-context';
import { MobileMenu } from './mobile-menu';
import { SearchOverlay } from './search-overlay';

const NAV_LINKS = [
  { href: '/loja', label: 'LOJA' },
  { href: '/pronta-entrega', label: 'PRONTA ENTREGA' },
  { href: '/colecoes', label: 'COLEÇÕES' },
  { href: '/faq', label: 'FAQ' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-charcoal shadow-lg shadow-charcoal/20' : 'bg-charcoal'
        }`}
      >
        <div className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center bg-charcoal border-b border-ivory/8 ${scrolled ? 'h-0 opacity-0' : 'h-8 opacity-100'}`}>
          <p className="text-ivory/50 text-[8px] sm:text-[10px] tracking-boutique font-sans uppercase whitespace-nowrap">
            Pecas originais com garantia de autenticidade &mdash; Parcele em ate 6x sem juros
          </p>
        </div>

        <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 border-b border-ivory/6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-ivory/70 hover:text-gold active:scale-95 transition-all duration-200"
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[11px] tracking-boutique font-sans text-gold/80 hover:text-gold transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold/50 after:transition-all after:duration-500 hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 hover:opacity-80 transition-opacity duration-300">
              <img
                src="https://i.imgur.com/ojXnQgu.png"
                alt="L7 Boutique"
                className="h-8 sm:h-9 lg:h-11 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-ivory/50 hover:text-ivory active:scale-90 transition-all duration-200"
                aria-label="Buscar"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <Link
                href="/conta"
                className="hidden lg:block p-2 text-ivory/50 hover:text-ivory transition-all duration-200"
                aria-label="Conta"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>
              <button
                onClick={openCart}
                className="p-2 text-ivory/50 hover:text-ivory active:scale-90 transition-all duration-200 relative"
                aria-label="Carrinho"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-charcoal text-[9px] font-sans font-semibold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className={`transition-all duration-500 ${scrolled ? 'h-14 sm:h-16 lg:h-20' : 'h-[calc(2rem+3.5rem)] sm:h-[calc(2rem+4rem)] lg:h-[calc(2rem+5rem)]'}`} />

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
