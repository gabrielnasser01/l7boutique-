'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/cart-context';
import { supabase } from '@/lib/supabase';
import { MobileMenu } from './mobile-menu';
import { SearchOverlay } from './search-overlay';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { openCart, totalItems } = useCart();
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    async function loadBrands() {
      const { data } = await supabase.from('brands').select('id, name, slug').order('name');
      if (data) setBrands(data);
    }
    loadBrands();
  }, []);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setBrandsOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setBrandsOpen(false), 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-charcoal shadow-lg shadow-charcoal/20' : 'bg-charcoal'
        }`}
      >
        <div className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center bg-charcoal border-b border-ivory/8 ${scrolled ? 'h-0 opacity-0' : 'h-8 opacity-100'}`}>
          <p className="text-ivory/50 text-[7px] sm:text-[10px] tracking-[0.1em] sm:tracking-boutique font-sans uppercase whitespace-nowrap">
            <span className="hidden sm:inline">Peças originais com garantia de autenticidade &mdash; Parcele em até 6x sem juros</span>
            <span className="sm:hidden">Originais com garantia &mdash; Até 6x sem juros</span>
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
              <Link
                href="/loja"
                className="relative text-[11px] tracking-boutique font-sans text-gold/80 hover:text-gold transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold/50 after:transition-all after:duration-500 hover:after:w-full"
              >
                LOJA
              </Link>
              <Link
                href="/pronta-entrega"
                className="relative text-[11px] tracking-boutique font-sans text-gold/80 hover:text-gold transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold/50 after:transition-all after:duration-500 hover:after:w-full"
              >
                PRONTA ENTREGA
              </Link>
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href="/colecoes"
                  className="relative flex items-center gap-1.5 text-[11px] tracking-boutique font-sans text-gold/80 hover:text-gold transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold/50 after:transition-all after:duration-500 hover:after:w-full"
                >
                  MARCAS
                  <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform duration-300 ${brandsOpen ? 'rotate-180' : ''}`} />
                </Link>
                <AnimatePresence>
                  {brandsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                    >
                      <div className="bg-charcoal border border-ivory/10 min-w-[180px] py-3 shadow-xl shadow-black/30">
                        {brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/loja?marca=${brand.slug}`}
                            onClick={() => setBrandsOpen(false)}
                            className="block px-6 py-2.5 text-[11px] tracking-boutique font-sans text-ivory/60 hover:text-gold hover:bg-ivory/5 transition-all duration-200"
                          >
                            {brand.name.toUpperCase()}
                          </Link>
                        ))}
                        <div className="border-t border-ivory/8 mt-2 pt-2">
                          <Link
                            href="/colecoes"
                            onClick={() => setBrandsOpen(false)}
                            className="block px-6 py-2.5 text-[11px] tracking-boutique font-sans text-gold/50 hover:text-gold transition-all duration-200"
                          >
                            VER TODAS
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                href="/faq"
                className="relative text-[11px] tracking-boutique font-sans text-gold/80 hover:text-gold transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold/50 after:transition-all after:duration-500 hover:after:w-full"
              >
                FAQ
              </Link>
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
