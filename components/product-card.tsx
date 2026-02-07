'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, formatInstallments } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'light' | 'dark';
}

export function ProductCard({ product, index = 0, variant = 'light' }: ProductCardProps) {
  const isDark = variant === 'dark';
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/produto/${product.slug}`} className="group block">
        <div className={`relative border overflow-hidden transition-shadow duration-500 group-hover:shadow-lg ${isDark ? 'border-ivory/10 bg-ivory/5 group-hover:shadow-ivory/5' : 'border-charcoal/8 bg-charcoal/3 group-hover:shadow-charcoal/5'}`}>
          <div className="aspect-[4/5] overflow-hidden">
            {product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            )}
          </div>

          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />

          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out p-4">
            <span className={`flex items-center justify-center gap-2 w-full py-2.5 backdrop-blur-sm text-[10px] tracking-boutique font-sans uppercase ${isDark ? 'bg-charcoal/95 text-ivory' : 'bg-ivory/95 text-charcoal'}`}>
              <Eye size={13} strokeWidth={1.5} />
              VER PRODUTO
            </span>
          </div>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && (
              <span className="text-[9px] tracking-boutique font-sans text-gold bg-charcoal/90 backdrop-blur-sm px-2.5 py-1 uppercase">
                NOVO
              </span>
            )}
            {product.is_bestseller && (
              <span className="text-[9px] tracking-boutique font-sans text-ivory/80 bg-charcoal/90 backdrop-blur-sm px-2.5 py-1 uppercase">
                BEST SELLER
              </span>
            )}
            {hasDiscount && (
              <span className="text-[9px] tracking-boutique font-sans text-gold bg-charcoal/90 backdrop-blur-sm px-2.5 py-1 uppercase">
                SALE
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 pb-2">
          <h3 className={`text-[14px] sm:text-[15px] font-serif leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300 ${isDark ? 'text-ivory' : 'text-charcoal'}`}>
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-[13px] sm:text-sm font-sans ${isDark ? 'text-ivory/80' : 'text-charcoal'}`}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className={`text-[11px] sm:text-xs font-sans line-through ${isDark ? 'text-ivory/30' : 'text-charcoal/30'}`}>
                {formatPrice(product.original_price!)}
              </span>
            )}
          </div>
          <p className={`text-[10px] sm:text-[11px] font-sans mt-1 ${isDark ? 'text-ivory/30' : 'text-charcoal/35'}`}>
            {formatInstallments(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
