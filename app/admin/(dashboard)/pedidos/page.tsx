'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { statusConfig, paymentMethodLabels, formatDateBR } from '@/lib/admin-helpers';
import { Search, ArrowUpRight, Loader2, Package } from 'lucide-react';

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as OrderStatus) || 'all';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const data = await adminApi.readOrders();
      setOrders((data as Order[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.customers?.name?.toLowerCase().includes(q) ||
          o.tracking_code?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Gerenciamento</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Pedidos</h1>
        <p className="text-[13px] text-[#555] mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''} no total</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
        <input
          type="text"
          placeholder="Buscar por pedido, cliente ou rastreio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all border ${
              statusFilter === s.value
                ? 'bg-[#C8A24D]/[0.08] text-[#D4AD4E] border-[#C8A24D]/[0.15]'
                : 'bg-[#0e0e0e] text-[#666] border-[#181818] hover:text-[#aaa] hover:border-[#222]'
            }`}
          >
            {s.label}
            {counts[s.value] !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${statusFilter === s.value ? 'bg-[#C8A24D]/[0.15]' : 'bg-[#141414]'}`}>
                {counts[s.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#444]">
            <Package className="w-10 h-10 mb-3 text-[#2a2a2a]" />
            <p className="text-[13px]">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#151515]">
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Pedido</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Cliente</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden sm:table-cell">Itens</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden md:table-cell">Data</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden md:table-cell">Pagamento</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Status</th>
                  <th className="text-right py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Total</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const status = statusConfig[order.status];
                  const itemCount = order.order_items?.length || 0;
                  return (
                    <tr key={order.id} className="border-b border-[#101010] hover:bg-[#0f0f0f] transition-colors">
                      <td className="py-3.5 px-5"><span className="text-[13px] font-mono text-[#C8A24D] font-medium">{order.order_number}</span></td>
                      <td className="py-3.5 px-5">
                        <div>
                          <p className="text-[13px] text-white">{order.customers?.name || '-'}</p>
                          {order.customers?.email && <p className="text-[11px] text-[#555] truncate max-w-[180px]">{order.customers.email}</p>}
                          <p className="text-[11px] text-[#444]">
                            {order.customers?.phone ? order.customers.phone : ''}
                            {order.customers?.phone && order.customers?.city ? ' · ' : ''}
                            {order.customers?.city && order.customers?.state ? `${order.customers.city}, ${order.customers.state}` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 hidden sm:table-cell"><span className="text-[13px] text-[#666]">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span></td>
                      <td className="py-3.5 px-5 hidden md:table-cell"><span className="text-[13px] text-[#666] font-mono">{formatDateBR(order.created_at)}</span></td>
                      <td className="py-3.5 px-5 hidden md:table-cell"><span className="text-[13px] text-[#666]">{paymentMethodLabels[order.payment_method]}</span></td>
                      <td className="py-3.5 px-5"><span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-lg ${status.bg} ${status.color}`}>{status.label}</span></td>
                      <td className="py-3.5 px-5 text-right"><span className="text-[13px] font-medium text-white">{formatPrice(order.total)}</span></td>
                      <td className="py-3.5 px-3">
                        <Link href={`/admin/pedidos/${order.id}`} className="p-1.5 text-[#444] hover:text-[#C8A24D] transition-colors inline-flex">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
