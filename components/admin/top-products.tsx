'use client';

import { OrderItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Trophy } from 'lucide-react';

interface TopProductsProps {
  orderItems: OrderItem[];
}

interface ProductStat {
  name: string;
  image: string;
  quantity: number;
  revenue: number;
}

export function TopProducts({ orderItems }: TopProductsProps) {
  const productStats = orderItems.reduce<Record<string, ProductStat>>((acc, item) => {
    const key = item.product_name;
    if (!acc[key]) {
      acc[key] = { name: item.product_name, image: item.product_image, quantity: 0, revenue: 0 };
    }
    acc[key].quantity += item.quantity;
    acc[key].revenue += item.unit_price * item.quantity;
    return acc;
  }, {});

  const sorted = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRevenue = sorted[0]?.revenue || 1;

  return (
    <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#C8A24D]/[0.06] border border-[#C8A24D]/[0.08]">
          <Trophy className="w-4 h-4 text-[#C8A24D]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">Top Produtos</h3>
          <p className="text-[11px] text-[#444]">Mais vendidos</p>
        </div>
      </div>
      <div className="space-y-4">
        {sorted.map((product, i) => (
          <div key={product.name} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#1c1c1c] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-[#555]">{i + 1}</span>
            </div>
            <div
              className="w-10 h-10 rounded-xl bg-[#141414] bg-cover bg-center flex-shrink-0 border border-[#1c1c1c]"
              style={{ backgroundImage: product.image ? `url(${product.image})` : undefined }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white truncate">{product.name}</p>
              <div className="mt-1.5 h-1 bg-[#141414] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B6914] to-[#C8A24D] transition-all duration-500"
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-[13px] font-medium text-white">{formatPrice(product.revenue)}</p>
              <p className="text-[10px] text-[#444]">{product.quantity} un.</p>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-[13px] text-[#444] text-center py-8">Sem dados ainda</p>}
      </div>
    </div>
  );
}
