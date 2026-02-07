'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Product, Category, Collection } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { FilterSidebar } from '@/components/shop/filter-sidebar';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const catParam = searchParams.get('categoria');
    if (catParam) setSelectedCategories([catParam]);
    const destaque = searchParams.get('destaque');
    if (destaque === 'novidades') setSortBy('newest');
    if (destaque === 'bestsellers') setSortBy('bestseller');
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const [productsRes, catsRes, colsRes] = await Promise.all([
        supabase.from('products').select('*, categories(*), collections(*)'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('collections').select('*').order('sort_order'),
      ]);
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (catsRes.data) setCategories(catsRes.data);
      if (colsRes.data) setCollections(colsRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      if (selectedCategories.length > 0) {
        const cat = p.categories as Category | undefined;
        if (!cat || !selectedCategories.includes(cat.slug)) return false;
      }
      if (selectedCollections.length > 0) {
        const col = p.collections as Collection | undefined;
        if (!col || !selectedCollections.includes(col.slug)) return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return filtered;
  }, [products, selectedCategories, selectedCollections, priceRange, sortBy]);

  const maxPrice = useMemo(() => Math.max(...products.map((p) => p.price), 3000), [products]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleCollection = (slug: string) => {
    setSelectedCollections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const activeFilterCount = selectedCategories.length + selectedCollections.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 lg:mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Curadoria</p>
        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Loja</h1>
      </div>

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-charcoal/8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/60 uppercase"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            FILTROS
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-gold text-charcoal text-[9px] font-semibold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="text-[12px] font-sans text-charcoal/40">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-[11px] tracking-boutique font-sans text-charcoal/60 bg-transparent border border-charcoal/15 px-4 py-2 uppercase appearance-none cursor-pointer outline-none"
        >
          <option value="newest">MAIS RECENTES</option>
          <option value="price-asc">MENOR PRECO</option>
          <option value="price-desc">MAIOR PRECO</option>
          <option value="bestseller">MAIS VENDIDOS</option>
        </select>
      </div>

      <div className="flex gap-10">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            collections={collections}
            selectedCategories={selectedCategories}
            selectedCollections={selectedCollections}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onCategoryToggle={toggleCategory}
            onCollectionToggle={toggleCollection}
            onPriceChange={setPriceRange}
          />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-charcoal/5" />
                  <div className="pt-4 space-y-2">
                    <div className="h-4 bg-charcoal/5 w-3/4" />
                    <div className="h-3 bg-charcoal/5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-serif text-charcoal/40 mb-2">Nenhum produto encontrado</p>
              <p className="text-[13px] font-sans text-charcoal/30">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-charcoal/40 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[61] w-full max-w-sm bg-ivory lg:hidden overflow-y-auto"
            >
              <FilterSidebar
                categories={categories}
                collections={collections}
                selectedCategories={selectedCategories}
                selectedCollections={selectedCollections}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onCategoryToggle={toggleCategory}
                onCollectionToggle={toggleCollection}
                onPriceChange={setPriceRange}
                onClose={() => setFilterOpen(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
