'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/contexts/user-auth-context';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  tracking_code: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  shipped: { label: 'Enviado', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  delivered: { label: 'Entregue', color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-200' },
};

export function OrdersTab() {
  const { user } = useUserAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      const { data } = await supabase.rpc('public_customer_orders', { p_email: user!.email });

      if (data && Array.isArray(data)) setOrders(data);
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-serif text-charcoal font-light mb-8">Meus Pedidos</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-charcoal/10">
          <Package size={32} strokeWidth={1} className="mx-auto text-charcoal/15 mb-4" />
          <p className="text-[13px] font-sans text-charcoal/30">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const isExpanded = expandedId === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                className="border border-charcoal/10"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-charcoal/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[13px] font-sans font-medium text-charcoal">
                        {order.order_number}
                      </p>
                      <p className="text-[11px] font-sans text-charcoal/35 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-[9px] tracking-boutique font-sans uppercase px-2.5 py-1 border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-sans text-charcoal font-medium">
                      {formatPrice(order.total)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} strokeWidth={1.5} className="text-charcoal/30" />
                    ) : (
                      <ChevronDown size={16} strokeWidth={1.5} className="text-charcoal/30" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-charcoal/8 px-5 pb-5"
                  >
                    {order.tracking_code && (
                      <div className="mt-4 p-3 bg-charcoal/[0.03] border border-charcoal/8">
                        <p className="text-[10px] tracking-boutique font-sans text-charcoal/40 uppercase mb-1">
                          Codigo de Rastreio
                        </p>
                        <p className="text-[13px] font-sans text-charcoal font-medium">
                          {order.tracking_code}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          {item.product_image && (
                            <div className="w-14 h-14 bg-charcoal/5 shrink-0 overflow-hidden">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-sans text-charcoal truncate">{item.product_name}</p>
                            <p className="text-[11px] font-sans text-charcoal/35">
                              Tam: {item.size} | Qtd: {item.quantity}
                            </p>
                          </div>
                          <p className="text-[12px] font-sans text-charcoal/60 shrink-0">
                            {formatPrice(item.unit_price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
