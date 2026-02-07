'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { Order, OrderItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { MetricCard } from '@/components/admin/metric-card';
import { SalesChart } from '@/components/admin/sales-chart';
import { RecentOrdersTable } from '@/components/admin/recent-orders-table';
import { TopProducts } from '@/components/admin/top-products';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allItems, setAllItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersData, itemsData] = await Promise.all([
        adminApi.readOrders(),
        adminApi.readAllOrderItems(),
      ]);
      setOrders((ordersData as Order[]) || []);
      setAllItems((itemsData as OrderItem[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = activeOrders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = activeOrders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(activeOrders.map((o) => o.customer_id)).size;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
    return { totalRevenue, totalOrders, avgTicket, uniqueCustomers, pendingOrders, shippedOrders };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Visao Geral</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Painel</h1>
        </div>
        {stats.pendingOrders > 0 && (
          <Link
            href="/admin/pedidos?status=pending"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-400/[0.06] text-amber-400 text-[13px] font-medium rounded-xl border border-amber-400/[0.12] hover:bg-amber-400/[0.1] transition-colors self-start"
          >
            <AlertCircle className="w-4 h-4" />
            {stats.pendingOrders} pedido{stats.pendingOrders > 1 ? 's' : ''} pendente{stats.pendingOrders > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={formatPrice(stats.totalRevenue)} icon={<DollarSign className="w-5 h-5" />} subtitle="Pedidos pagos" />
        <MetricCard title="Pedidos" value={String(stats.totalOrders)} icon={<ShoppingBag className="w-5 h-5" />} subtitle={`${stats.shippedOrders} enviados`} />
        <MetricCard title="Ticket Medio" value={formatPrice(stats.avgTicket)} icon={<TrendingUp className="w-5 h-5" />} />
        <MetricCard title="Clientes" value={String(stats.uniqueCustomers)} icon={<Users className="w-5 h-5" />} subtitle="Clientes unicos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart orders={orders} />
        </div>
        <TopProducts orderItems={allItems} />
      </div>

      <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#141414]">
          <h3 className="text-sm font-medium text-white">Pedidos Recentes</h3>
          <Link href="/admin/pedidos" className="flex items-center gap-1.5 text-[12px] text-[#C8A24D] hover:text-[#D4B66A] font-medium transition-colors">
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RecentOrdersTable orders={orders.slice(0, 8)} />
      </div>
    </div>
  );
}
