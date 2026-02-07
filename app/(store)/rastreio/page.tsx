'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import {
  Package, Search, MapPin, Truck, CheckCircle2, Clock,
  XCircle, Loader2, ExternalLink, ShoppingBag,
} from 'lucide-react';

const statusSteps: { key: OrderStatus; label: string; icon: typeof Package }[] = [
  { key: 'pending', label: 'Pedido recebido', icon: ShoppingBag },
  { key: 'confirmed', label: 'Pedido confirmado', icon: CheckCircle2 },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: MapPin },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

function getStepIndex(status: OrderStatus): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function TrackingPage() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = code.trim();
    if (!query) return;

    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const { data } = await supabase.rpc('public_track_order', { p_query: query });

    if (data) {
      setOrder(data as Order);
      setNotFound(false);
    } else {
      setOrder(null);
      setNotFound(true);
    }
    setSearched(true);
    setLoading(false);
  }

  const currentStep = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Acompanhe</p>
          <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Rastrear Pedido</h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <div className="flex-1 relative">
            <Package size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
              placeholder="Numero do pedido (ex: L7-0001) ou codigo de rastreio"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-charcoal text-ivory text-[11px] tracking-boutique font-sans uppercase hover:bg-charcoal/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} strokeWidth={1.5} />}
            RASTREAR
          </button>
        </form>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <Loader2 size={24} className="animate-spin text-charcoal/30" />
            </motion.div>
          )}

          {!loading && notFound && searched && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 border border-charcoal/10"
            >
              <XCircle size={32} strokeWidth={1} className="mx-auto text-charcoal/20 mb-4" />
              <p className="text-[14px] font-serif text-charcoal/60 mb-2">Pedido nao encontrado</p>
              <p className="text-[12px] font-sans text-charcoal/35 max-w-sm mx-auto leading-relaxed">
                Verifique o numero do pedido ou codigo de rastreio e tente novamente.
              </p>
            </motion.div>
          )}

          {!loading && order && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="border border-charcoal/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] tracking-boutique font-sans text-charcoal/40 uppercase mb-1">Pedido</p>
                    <p className="text-[15px] font-serif text-charcoal">{order.order_number}</p>
                  </div>
                  <span className={`text-[9px] tracking-boutique font-sans px-3 py-1.5 uppercase border ${
                    isCancelled
                      ? 'text-red-500 border-red-500/30'
                      : 'text-gold border-gold/40'
                  }`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100">
                    <XCircle size={18} strokeWidth={1.5} className="text-red-400 flex-shrink-0" />
                    <p className="text-[13px] font-sans text-red-600/80">
                      Este pedido foi cancelado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {statusSteps.map((step, i) => {
                      const isDone = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isDone ? 'bg-charcoal' : 'bg-charcoal/10'
                            }`}>
                              <step.icon size={14} strokeWidth={1.5} className={isDone ? 'text-ivory' : 'text-charcoal/30'} />
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={`w-px h-8 ${isDone && i < currentStep ? 'bg-charcoal/30' : 'bg-charcoal/10'}`} />
                            )}
                          </div>
                          <div className="pt-1">
                            <p className={`text-[13px] font-sans ${isDone ? 'text-charcoal' : 'text-charcoal/40'} ${isCurrent ? 'font-medium' : ''}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-[11px] font-sans text-gold mt-0.5">Status atual</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {order.tracking_code && (
                <div className="border border-charcoal/10 p-6">
                  <p className="text-[10px] tracking-boutique font-sans text-charcoal/40 uppercase mb-3">Codigo de rastreio</p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[15px] font-mono text-charcoal tracking-wide">{order.tracking_code}</p>
                    <a
                      href={`https://www.linkcorreios.com.br/?id=${order.tracking_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] tracking-boutique font-sans text-gold uppercase hover:text-charcoal transition-colors"
                    >
                      Rastrear nos Correios
                      <ExternalLink size={12} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              )}

              {order.order_items && order.order_items.length > 0 && (
                <div className="border border-charcoal/10 p-6">
                  <p className="text-[10px] tracking-boutique font-sans text-charcoal/40 uppercase mb-4">Itens do pedido</p>
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 bg-charcoal/5 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: item.product_image ? `url(${item.product_image})` : undefined }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-sans text-charcoal truncate">{item.product_name}</p>
                          <p className="text-[11px] font-sans text-charcoal/40">
                            Tam: {item.size} {item.quantity > 1 ? ` / Qtd: ${item.quantity}` : ''}
                          </p>
                        </div>
                        <p className="text-[13px] font-sans text-charcoal flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-charcoal/10 flex justify-between">
                    <span className="text-[13px] font-sans text-charcoal/50">Total</span>
                    <span className="text-[14px] font-serif text-charcoal">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && !loading && (
          <div className="text-center">
            <p className="text-[13px] font-sans text-charcoal/40 leading-relaxed">
              Insira o numero do pedido ou o codigo de rastreio dos Correios para acompanhar sua entrega.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
