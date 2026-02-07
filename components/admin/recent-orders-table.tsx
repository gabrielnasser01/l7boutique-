'use client';

import Link from 'next/link';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { statusConfig, paymentMethodLabels, formatDateBR } from '@/lib/admin-helpers';
import { ArrowUpRight } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-14 text-[#444]">
        <p className="text-[13px]">Nenhum pedido encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#151515]">
            <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Pedido</th>
            <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Cliente</th>
            <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden sm:table-cell">Data</th>
            <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden md:table-cell">Pagamento</th>
            <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Status</th>
            <th className="text-right py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Total</th>
            <th className="py-3 px-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <tr key={order.id} className="border-b border-[#101010] hover:bg-[#0f0f0f] transition-colors">
                <td className="py-3.5 px-5">
                  <span className="text-[13px] font-mono text-[#C8A24D] font-medium">{order.order_number}</span>
                </td>
                <td className="py-3.5 px-5">
                  <span className="text-[13px] text-white">{order.customers?.name || '-'}</span>
                </td>
                <td className="py-3.5 px-5 hidden sm:table-cell">
                  <span className="text-[13px] text-[#666] font-mono">{formatDateBR(order.created_at)}</span>
                </td>
                <td className="py-3.5 px-5 hidden md:table-cell">
                  <span className="text-[13px] text-[#666]">{paymentMethodLabels[order.payment_method]}</span>
                </td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-lg ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="text-[13px] font-medium text-white">{formatPrice(order.total)}</span>
                </td>
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
  );
}
