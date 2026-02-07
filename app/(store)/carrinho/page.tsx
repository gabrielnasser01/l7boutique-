'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatPrice, formatInstallments } from '@/lib/format';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-charcoal/20 mb-6" />
        <h1 className="text-2xl font-serif text-charcoal mb-3">Seu carrinho esta vazio</h1>
        <p className="text-[13px] font-sans text-charcoal/40 mb-8">Explore nossa curadoria de pecas atemporais.</p>
        <Link
          href="/loja"
          className="inline-block text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-10 py-4 uppercase hover:bg-charcoal hover:text-ivory transition-colors duration-300"
        >
          EXPLORAR LOJA
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 lg:mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Seu Carrinho</p>
        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Carrinho</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 pb-4 border-b border-charcoal/10 text-[10px] tracking-boutique font-sans text-charcoal/40 uppercase">
            <span>Produto</span>
            <span>Preco</span>
            <span>Quantidade</span>
            <span>Total</span>
            <span />
          </div>

          <div className="space-y-0">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color?.name || 'no-color'}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[80px_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 lg:gap-4 py-6 border-b border-charcoal/8 items-center"
              >
                <div className="flex gap-4 col-span-1 lg:col-auto">
                  <div className="w-20 h-24 lg:w-24 lg:h-28 bg-charcoal/5 flex-shrink-0 overflow-hidden">
                    {item.product.images[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-[15px] font-serif text-charcoal leading-tight">{item.product.name}</p>
                    <p className="text-[11px] font-sans text-charcoal/40 mt-1">{item.size}{item.color ? ` / ${item.color.name}` : ''}</p>
                  </div>
                </div>

                <div className="lg:hidden">
                  <p className="text-[14px] font-serif text-charcoal leading-tight">{item.product.name}</p>
                  <p className="text-[11px] font-sans text-charcoal/40 mt-1">{item.size}{item.color ? ` / ${item.color.name}` : ''}</p>
                  <p className="text-sm font-sans text-charcoal mt-2">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-charcoal/15">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal/40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-[12px] font-sans">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-charcoal/40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size, item.color?.name || null)}
                      className="p-1 text-charcoal/30 hover:text-charcoal transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <span className="hidden lg:block text-sm font-sans text-charcoal">{formatPrice(item.product.price)}</span>

                <div className="hidden lg:flex items-center border border-charcoal/15 w-fit">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal/40 hover:text-charcoal"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center text-[12px] font-sans">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal/40 hover:text-charcoal"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="hidden lg:block text-sm font-sans text-charcoal font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </span>

                <button
                  onClick={() => removeItem(item.product.id, item.size, item.color?.name || null)}
                  className="hidden lg:block p-1 text-charcoal/30 hover:text-charcoal transition-colors"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link
              href="/loja"
              className="flex items-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              CONTINUAR COMPRANDO
            </Link>
            <button
              onClick={clearCart}
              className="text-[11px] tracking-boutique font-sans text-charcoal/30 hover:text-charcoal transition-colors uppercase"
            >
              LIMPAR CARRINHO
            </button>
          </div>
        </div>

        <div>
          <div className="border border-charcoal/10 p-8">
            <h3 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase mb-6">Resumo</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-sans text-charcoal/50">Subtotal</span>
                <span className="text-[13px] font-sans text-charcoal">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-sans text-charcoal/50">Frete</span>
                <span className="text-[13px] font-sans text-charcoal/50">
                  {totalPrice >= 499 ? 'Gratis' : 'Calculado no checkout'}
                </span>
              </div>
            </div>

            <div className="border-t border-charcoal/10 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-sans text-charcoal font-medium">Total</span>
                <span className="text-xl font-serif text-charcoal">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-[11px] font-sans text-charcoal/35 mt-1 text-right">
                {formatInstallments(totalPrice)}
              </p>
            </div>

            <Link
              href="/checkout"
              className="w-full h-12 flex items-center justify-center gap-2 bg-charcoal text-ivory border border-charcoal text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 mb-4"
            >
              <Lock size={14} strokeWidth={1.5} />
              FINALIZAR COMPRA
            </Link>

            <p className="text-[10px] font-sans text-charcoal/30 text-center">
              Pagamento 100% seguro. PIX com 5% de desconto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
