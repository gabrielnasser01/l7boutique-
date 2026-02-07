'use client';

import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-charcoal/40"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-md bg-ivory border-l border-charcoal/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/10">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase">Carrinho</h2>
                {totalItems > 0 && (
                  <span className="text-[10px] font-sans text-charcoal/40">({totalItems})</span>
                )}
              </div>
              <button onClick={closeCart} className="p-1 text-charcoal/60 hover:text-charcoal transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <ShoppingBag size={32} strokeWidth={1} className="text-charcoal/20 mb-4" />
                <p className="text-sm font-sans text-charcoal/40 mb-6">Seu carrinho esta vazio</p>
                <Link
                  href="/loja"
                  onClick={closeCart}
                  className="text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-8 py-3 uppercase hover:bg-charcoal hover:text-ivory transition-colors duration-300"
                >
                  EXPLORAR LOJA
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color?.name || 'no-color'}`}
                      className="flex gap-4 py-4 border-b border-charcoal/8"
                    >
                      <div className="w-20 h-24 bg-charcoal/5 flex-shrink-0 overflow-hidden">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif text-charcoal leading-tight">{item.product.name}</p>
                        <p className="text-[11px] font-sans text-charcoal/40 mt-1">
                          {item.size}{item.color ? ` / ${item.color.name}` : ''}
                        </p>
                        <p className="text-sm font-sans text-gold mt-2">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-charcoal/15">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 h-7 flex items-center justify-center text-[11px] font-sans text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color?.name || null, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color?.name || null)}
                            className="text-[10px] tracking-boutique font-sans text-charcoal/30 hover:text-charcoal transition-colors uppercase"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-charcoal/10 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-boutique font-sans text-charcoal/50 uppercase">Subtotal</span>
                    <span className="text-lg font-serif text-charcoal">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-[11px] font-sans text-charcoal/30">Frete calculado no checkout</p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full text-center text-[11px] tracking-boutique font-sans text-ivory bg-charcoal border border-charcoal px-8 py-4 uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400"
                  >
                    FINALIZAR COMPRA
                  </Link>
                  <button
                    onClick={closeCart}
                    className="block w-full text-center text-[11px] tracking-boutique font-sans text-charcoal/40 hover:text-charcoal transition-colors duration-300 uppercase py-2"
                  >
                    CONTINUAR COMPRANDO
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
