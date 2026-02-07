'use client';

import { useMemo } from 'react';
import { Order } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = 0;
    }

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        const key = new Date(order.created_at).toISOString().split('T')[0];
        if (key in days) {
          days[key] += Number(order.total);
        }
      });

    return Object.entries(days).map(([date, total]) => ({
      date,
      total,
      label: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
    }));
  }, [orders]);

  const maxValue = Math.max(...dailyData.map((d) => d.total), 1);
  const totalPeriod = dailyData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#C8A24D]/[0.06] border border-[#C8A24D]/[0.08]">
            <BarChart3 className="w-4 h-4 text-[#C8A24D]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Vendas</h3>
            <p className="text-[11px] text-[#444]">Ultimos 14 dias</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">R$ {totalPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-[#444]">Total do periodo</p>
        </div>
      </div>
      <div className="flex items-end gap-[6px] h-44">
        {dailyData.map((day) => {
          const height = maxValue > 0 ? (day.total / maxValue) * 100 : 0;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              <div className="relative w-full flex justify-center">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-9 bg-[#1a1a1a] border border-[#222] text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-all duration-200 shadow-lg shadow-black/40">
                  R$ {day.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div
                  className="w-full max-w-[28px] rounded-md transition-all duration-300 group-hover:brightness-125"
                  style={{
                    height: `${Math.max(height, 3)}%`,
                    background:
                      day.total > 0
                        ? 'linear-gradient(to top, #8B6914, #C8A24D)'
                        : '#151515',
                  }}
                />
              </div>
              <span className="text-[8px] text-[#444] hidden sm:block font-mono">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
