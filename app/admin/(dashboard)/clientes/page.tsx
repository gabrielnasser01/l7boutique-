'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Customer } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { formatDateBR } from '@/lib/admin-helpers';
import { Search, Loader2, Users, MapPin } from 'lucide-react';

interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: number;
  lastOrder: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const [custs, ords] = await Promise.all([
        adminApi.readCustomers() as Promise<Customer[]>,
        adminApi.readOrderStats() as Promise<{ customer_id: string; total: number; created_at: string; status: string }[]>,
      ]);

      const statsMap: Record<string, { count: number; spent: number; lastDate: string | null }> = {};
      ords.filter((o) => o.status !== 'cancelled').forEach((o) => {
        if (!statsMap[o.customer_id]) statsMap[o.customer_id] = { count: 0, spent: 0, lastDate: null };
        statsMap[o.customer_id].count++;
        statsMap[o.customer_id].spent += Number(o.total);
        if (!statsMap[o.customer_id].lastDate || o.created_at > statsMap[o.customer_id].lastDate!) {
          statsMap[o.customer_id].lastDate = o.created_at;
        }
      });

      const merged: CustomerWithStats[] = custs.map((c) => ({
        ...c,
        totalOrders: statsMap[c.id]?.count || 0,
        totalSpent: statsMap[c.id]?.spent || 0,
        lastOrder: statsMap[c.id]?.lastDate || null,
      }));
      merged.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(merged);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone.includes(q) || c.city?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Base de dados</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Clientes</h1>
        <p className="text-[13px] text-[#555] mt-1">{customers.length} cliente{customers.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
        <input type="text" placeholder="Buscar por nome, email, telefone ou cidade..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl flex flex-col items-center justify-center py-20 text-[#444]">
          <Users className="w-10 h-10 mb-3 text-[#2a2a2a]" />
          <p className="text-[13px]">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#151515]">
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Cliente</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden sm:table-cell">Contato</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden md:table-cell">Cidade</th>
                  <th className="text-center py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Pedidos</th>
                  <th className="text-right py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest">Total Gasto</th>
                  <th className="text-right py-3 px-5 text-[10px] font-semibold text-[#555] uppercase tracking-widest hidden lg:table-cell">Ultimo Pedido</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-[#101010] hover:bg-[#0f0f0f] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8A24D]/[0.1] to-[#A6832E]/[0.1] border border-[#C8A24D]/[0.08] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-semibold text-[#C8A24D]">{customer.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                        </div>
                        <span className="text-[13px] text-white font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 hidden sm:table-cell">
                      <p className="text-[13px] text-[#777]">{customer.phone}</p>
                      {customer.email && <p className="text-[11px] text-[#444]">{customer.email}</p>}
                    </td>
                    <td className="py-3.5 px-5 hidden md:table-cell">
                      {customer.city && customer.state ? (
                        <span className="flex items-center gap-1.5 text-[13px] text-[#777]"><MapPin className="w-3 h-3 text-[#444]" />{customer.city}, {customer.state}</span>
                      ) : <span className="text-[13px] text-[#333]">-</span>}
                    </td>
                    <td className="py-3.5 px-5 text-center"><span className="text-[13px] text-[#777] font-mono">{customer.totalOrders}</span></td>
                    <td className="py-3.5 px-5 text-right"><span className="text-[13px] font-medium text-white">{formatPrice(customer.totalSpent)}</span></td>
                    <td className="py-3.5 px-5 text-right hidden lg:table-cell"><span className="text-[13px] text-[#666] font-mono">{customer.lastOrder ? formatDateBR(customer.lastOrder) : '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
