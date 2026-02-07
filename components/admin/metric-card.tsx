'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
}

export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <div className="relative bg-[#0e0e0e] border border-[#181818] rounded-2xl p-5 hover:border-[#222] transition-all duration-300 group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C8A24D]/[0.03] to-transparent rounded-bl-full" />
      <div className="flex items-start justify-between mb-5">
        <div className="p-2.5 rounded-xl bg-[#C8A24D]/[0.06] border border-[#C8A24D]/[0.08] text-[#C8A24D] group-hover:bg-[#C8A24D]/[0.1] transition-colors">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${
              trend.value >= 0
                ? 'text-emerald-400 bg-emerald-400/8'
                : 'text-[#ff5555] bg-[#ff5555]/8'
            }`}
          >
            {trend.value >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-[#555] text-[11px] font-medium uppercase tracking-wider mb-1.5">{title}</p>
      <p className="text-[22px] font-semibold text-white tracking-tight">{value}</p>
      {subtitle && <p className="text-[#444] text-[11px] mt-1.5">{subtitle}</p>}
    </div>
  );
}
