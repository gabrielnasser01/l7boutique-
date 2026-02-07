'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/product-form';
import { Loader2, Package } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*), collections(*)')
        .eq('id', params.id)
        .maybeSingle();
      setProduct(data as Product | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#555]">
        <Package className="w-10 h-10 mb-3" />
        <p className="text-sm">Produto nao encontrado</p>
        <Link href="/admin/produtos" className="text-sm text-[#C8A24D] mt-3">Voltar aos produtos</Link>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
