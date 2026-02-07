'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
import { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Search, Loader2, Package, Plus, Check, X, Eye, EyeOff, Pencil } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setProducts((prodRes.data as Product[]) || []);
      setCategories((catRes.data as Category[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const tabs = useMemo(() => {
    const list: { value: string; label: string }[] = [{ value: 'all', label: 'Todos' }];
    categories.forEach((c) => list.push({ value: c.slug, label: c.name }));
    list.push({ value: 'pronta_entrega', label: 'Pronta Entrega' });
    list.push({ value: 'esgotados', label: 'Esgotados' });
    return list;
  }, [categories]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeTab === 'pronta_entrega' && !p.pronta_entrega) return false;
      else if (activeTab === 'esgotados' && p.in_stock) return false;
      else if (activeTab !== 'all' && activeTab !== 'pronta_entrega' && activeTab !== 'esgotados') {
        if (p.categories?.slug !== activeTab) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, searchQuery, activeTab]);

  async function toggleStock(product: Product) {
    const newVal = !product.in_stock;
    await adminApi.writeProduct({ in_stock: newVal }, product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, in_stock: newVal } : p));
  }

  async function toggleFeatured(product: Product) {
    const newVal = !product.is_featured;
    await adminApi.writeProduct({ is_featured: newVal }, product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_featured: newVal } : p));
  }

  async function toggleProntaEntrega(product: Product) {
    const newVal = !product.pronta_entrega;
    await adminApi.writeProduct({ pronta_entrega: newVal }, product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, pronta_entrega: newVal } : p));
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Catalogo</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Produtos</h1>
          <p className="text-[13px] text-[#555] mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrados</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all self-start shadow-md shadow-[#C8A24D]/10"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
        <input
          type="text"
          placeholder="Buscar por nome ou marca..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all border ${
              activeTab === tab.value
                ? 'bg-[#C8A24D]/[0.08] text-[#D4AD4E] border-[#C8A24D]/[0.15]'
                : 'bg-[#0e0e0e] text-[#666] border-[#181818] hover:text-[#aaa] hover:border-[#222]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl flex flex-col items-center justify-center py-20 text-[#444]">
          <Package className="w-10 h-10 mb-3 text-[#2a2a2a]" />
          <p className="text-[13px]">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-[#0e0e0e] border border-[#181818] rounded-2xl overflow-hidden hover:border-[#222] transition-all duration-200">
              <div className="flex items-start gap-4 p-4">
                <div
                  className="w-16 h-16 rounded-xl bg-[#141414] bg-cover bg-center flex-shrink-0 border border-[#1c1c1c]"
                  style={{ backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : undefined }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-medium text-white truncate">{product.name}</h3>
                  <p className="text-[11px] text-[#555] mt-0.5">{product.brand || 'Sem marca'} &middot; {product.categories?.name || 'Sem categoria'}</p>
                  <p className="text-[13px] font-semibold text-[#C8A24D] mt-1.5">{formatPrice(product.price)}</p>
                </div>
                <Link href={`/admin/produtos/${product.id}`} className="p-2 rounded-lg text-[#444] hover:text-[#C8A24D] hover:bg-[#C8A24D]/[0.06] transition-all">
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>

              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-1">
                  {product.sizes?.map((size) => (
                    <span key={size} className="text-[10px] px-2 py-0.5 bg-[#141414] border border-[#1c1c1c] rounded-md text-[#666] font-mono">{size}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center border-t border-[#141414] divide-x divide-[#141414]">
                <button onClick={() => toggleStock(product)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors ${product.in_stock ? 'text-emerald-400/80 hover:bg-emerald-400/[0.04]' : 'text-[#ff5555]/70 hover:bg-[#ff5555]/[0.04]'}`}>
                  {product.in_stock ? <><Check className="w-3.5 h-3.5" />Estoque</> : <><X className="w-3.5 h-3.5" />Esgotado</>}
                </button>
                <button onClick={() => toggleFeatured(product)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors ${product.is_featured ? 'text-[#C8A24D]/80 hover:bg-[#C8A24D]/[0.04]' : 'text-[#444] hover:bg-[#111]'}`}>
                  {product.is_featured ? <><Eye className="w-3.5 h-3.5" />Destaque</> : <><EyeOff className="w-3.5 h-3.5" />Oculto</>}
                </button>
                <button onClick={() => toggleProntaEntrega(product)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors ${product.pronta_entrega ? 'text-cyan-400/80 hover:bg-cyan-400/[0.04]' : 'text-[#444] hover:bg-[#111]'}`}>
                  {product.pronta_entrega ? <><Check className="w-3.5 h-3.5" />P. Entrega</> : <>P. Entrega</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
