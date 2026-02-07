'use client';

import { X } from 'lucide-react';
import { Category, Collection } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface FilterSidebarProps {
  categories: Category[];
  collections: Collection[];
  selectedCategories: string[];
  selectedCollections: string[];
  priceRange: [number, number];
  maxPrice: number;
  onCategoryToggle: (slug: string) => void;
  onCollectionToggle: (slug: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({
  categories,
  collections,
  selectedCategories,
  selectedCollections,
  priceRange,
  maxPrice,
  onCategoryToggle,
  onCollectionToggle,
  onPriceChange,
  onClose,
  isMobile,
}: FilterSidebarProps) {
  return (
    <div className={isMobile ? 'p-6' : ''}>
      {isMobile && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase">Filtros</h2>
          <button onClick={onClose} className="p-1 text-charcoal/60 hover:text-charcoal transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-[10px] tracking-wide-boutique font-sans text-gold mb-5 uppercase">Categorias</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => onCategoryToggle(cat.slug)}
                className="border-charcoal/20 data-[state=checked]:bg-charcoal data-[state=checked]:border-charcoal"
              />
              <span className="text-[13px] font-sans text-charcoal/60 group-hover:text-charcoal transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[10px] tracking-wide-boutique font-sans text-gold mb-5 uppercase">Colecoes</h3>
        <div className="space-y-3">
          {collections.map((col) => (
            <label key={col.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedCollections.includes(col.slug)}
                onCheckedChange={() => onCollectionToggle(col.slug)}
                className="border-charcoal/20 data-[state=checked]:bg-charcoal data-[state=checked]:border-charcoal"
              />
              <span className="text-[13px] font-sans text-charcoal/60 group-hover:text-charcoal transition-colors">
                {col.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] tracking-wide-boutique font-sans text-gold mb-5 uppercase">Preco</h3>
        <Slider
          value={[priceRange[0], priceRange[1]]}
          min={0}
          max={maxPrice}
          step={50}
          onValueChange={(val) => onPriceChange([val[0], val[1]])}
          className="mb-3"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans text-charcoal/50">R$ {priceRange[0]}</span>
          <span className="text-[11px] font-sans text-charcoal/50">R$ {priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
}
