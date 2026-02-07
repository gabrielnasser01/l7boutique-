'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, ProductColor } from '@/lib/types';
import { useCart } from '@/contexts/cart-context';
import { formatPrice, formatInstallments } from '@/lib/format';
import { ProductCard } from '@/components/product-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*), collections(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        const p = data as Product;
        setProduct(p);
        setSelectedSize(p.sizes[0] || '');
        setSelectedColor(p.colors[0] || null);
        setSelectedImage(0);
        setQuantity(1);

        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', p.category_id)
          .neq('id', p.id)
          .limit(4);
        if (rel) setRelated(rel as Product[]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-6 h-6 border border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-40">
        <h1 className="text-2xl font-serif text-charcoal/40">Produto nao encontrado</h1>
      </div>
    );
  }

  const hasDiscount = product.original_price && product.original_price > product.price;

  const hasColors = product.colors && product.colors.length > 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    if (hasColors && !selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-12">
      <nav className="mb-6 lg:mb-10">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-charcoal/40">
          <li><Link href="/" className="hover:text-charcoal transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/loja" className="hover:text-charcoal transition-colors">Loja</Link></li>
          <li>/</li>
          <li className="text-charcoal/70 truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="aspect-[4/5] overflow-hidden bg-charcoal/5 border border-charcoal/8 mb-3 group cursor-crosshair">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-[70px] sm:w-16 sm:h-20 overflow-hidden border transition-all duration-300 ${
                    i === selectedImage ? 'border-gold opacity-100' : 'border-charcoal/10 opacity-60 hover:opacity-100 hover:border-charcoal/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:pt-4"
        >
          <div className="flex items-center gap-2 mb-4">
            {product.is_new && (
              <span className="text-[9px] tracking-boutique font-sans text-gold bg-charcoal/90 px-2.5 py-1 uppercase">NOVO</span>
            )}
            {product.is_bestseller && (
              <span className="text-[9px] tracking-boutique font-sans text-ivory/80 bg-charcoal/90 px-2.5 py-1 uppercase">BEST SELLER</span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-serif text-charcoal font-light mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-xl font-sans text-charcoal">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm font-sans text-charcoal/30 line-through">{formatPrice(product.original_price!)}</span>
            )}
          </div>
          <p className="text-[12px] font-sans text-charcoal/40 mb-8">{formatInstallments(product.price)}</p>

          <p className="text-[14px] font-sans text-charcoal/60 leading-relaxed mb-8">{product.description}</p>

          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] tracking-wide-boutique font-sans text-charcoal/50 uppercase mb-3">
                Cor: {selectedColor?.name}
              </p>
              <div className="flex gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 border-2 transition-all duration-300 active:scale-90 ${
                      selectedColor?.name === color.name ? 'border-gold scale-110' : 'border-charcoal/10 hover:border-charcoal/30'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] tracking-wide-boutique font-sans text-charcoal/50 uppercase mb-3">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[42px] sm:min-w-[44px] h-10 px-3 border text-[12px] font-sans transition-all duration-300 active:scale-95 ${
                      selectedSize === size
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-charcoal/15 text-charcoal/70 hover:border-charcoal hover:text-charcoal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center border border-charcoal/15 transition-colors duration-300 hover:border-charcoal/30">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 sm:w-10 h-11 sm:h-12 flex items-center justify-center text-charcoal/40 hover:text-charcoal active:scale-90 transition-all duration-200"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 sm:w-10 h-11 sm:h-12 flex items-center justify-center text-[13px] font-sans text-charcoal">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 sm:w-10 h-11 sm:h-12 flex items-center justify-center text-charcoal/40 hover:text-charcoal active:scale-90 transition-all duration-200"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || (hasColors && !selectedColor)}
              className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-3 bg-charcoal text-ivory border border-charcoal text-[10px] sm:text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-charcoal disabled:hover:text-ivory"
            >
              <ShoppingBag size={15} strokeWidth={1.5} />
              ADICIONAR AO CARRINHO
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-charcoal/8 mb-8">
            <div className="text-center">
              <Truck size={18} strokeWidth={1.5} className="mx-auto text-gold mb-2" />
              <p className="text-[10px] font-sans text-charcoal/50">Frete gratis acima de R$ 499</p>
            </div>
            <div className="text-center">
              <RotateCcw size={18} strokeWidth={1.5} className="mx-auto text-gold mb-2" />
              <p className="text-[10px] font-sans text-charcoal/50">Troca em ate 30 dias</p>
            </div>
            <div className="text-center">
              <Shield size={18} strokeWidth={1.5} className="mx-auto text-gold mb-2" />
              <p className="text-[10px] font-sans text-charcoal/50">Garantia de 90 dias</p>
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="material" className="border-b border-charcoal/8">
              <AccordionTrigger className="text-[13px] font-sans text-charcoal hover:text-gold transition-colors py-4 hover:no-underline">
                Material e Composicao
              </AccordionTrigger>
              <AccordionContent className="text-[13px] font-sans text-charcoal/50 leading-relaxed pb-4">
                {product.material}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care" className="border-b border-charcoal/8">
              <AccordionTrigger className="text-[13px] font-sans text-charcoal hover:text-gold transition-colors py-4 hover:no-underline">
                Cuidados
              </AccordionTrigger>
              <AccordionContent className="text-[13px] font-sans text-charcoal/50 leading-relaxed pb-4">
                {product.care_instructions}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="border-b border-charcoal/8">
              <AccordionTrigger className="text-[13px] font-sans text-charcoal hover:text-gold transition-colors py-4 hover:no-underline">
                Envio e Entregas
              </AccordionTrigger>
              <AccordionContent className="text-[13px] font-sans text-charcoal/50 leading-relaxed pb-4">
                Enviamos em ate 2 dias uteis. Frete gratis para compras acima de R$ 499. Prazo de entrega de 3 a 10 dias uteis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 lg:mt-28 pt-14 border-t border-charcoal/8">
          <h2 className="text-2xl font-serif text-charcoal font-light mb-10">Voce Tambem Pode Gostar</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
