'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
import { Product, Category, Collection, Brand } from '@/lib/types';
import { MultiImageUpload } from '@/components/admin/image-upload';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';

const SHOE_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const CLOTHING_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

interface ProductFormProps {
  product?: Product | null;
  isNew?: boolean;
}

export function ProductForm({ product, isNew = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [collectionId, setCollectionId] = useState(product?.collection_id || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [material, setMaterial] = useState(product?.material || '');
  const [careInstructions, setCareInstructions] = useState(product?.care_instructions || '');
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isNew_, setIsNew_] = useState(product?.is_new ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);
  const [prontaEntrega, setProntaEntrega] = useState(product?.pronta_entrega ?? false);

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('collections').select('*').order('sort_order'),
      supabase.from('brands').select('*').order('sort_order'),
    ]).then(([catRes, colRes, brandRes]) => {
      if (catRes.data) setCategories(catRes.data);
      if (colRes.data) setCollections(colRes.data);
      if (brandRes.data) setBrands(brandRes.data);
    });
  }, []);

  function toggleSize(size: string) {
    setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSave() {
    if (!name || !price) return;
    setSaving(true);

    const payload = {
      name,
      slug: generateSlug(name),
      brand,
      description,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category_id: categoryId || null,
      collection_id: collectionId || null,
      images,
      sizes,
      material,
      care_instructions: careInstructions,
      in_stock: inStock,
      is_featured: isFeatured,
      is_new: isNew_,
      is_bestseller: isBestseller,
      pronta_entrega: prontaEntrega,
    };

    try {
      await adminApi.writeProduct(payload, isNew ? null : product?.id);
      router.push('/admin/produtos');
    } catch {
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!product || !confirm('Tem certeza que deseja excluir este produto?')) return;
    setDeleting(true);
    await adminApi.deleteProduct(product.id);
    router.push('/admin/produtos');
  }

  const inputClass = 'w-full px-4 py-2.5 bg-[#080808] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/produtos')} className="p-2.5 rounded-xl bg-[#0e0e0e] border border-[#181818] text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest">{isNew ? 'Criar' : 'Editar'}</p>
          <h1 className="text-xl font-semibold text-white tracking-tight">{isNew ? 'Novo Produto' : product?.name || 'Editar Produto'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-5">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest">Informacoes</h3>

            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Nome do produto</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: LV Trainer 2026 Branco" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Marca</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass}>
                  <option value="">Selecionar...</option>
                  {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Categoria</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                  <option value="">Selecionar...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Colecao</label>
              <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className={inputClass}>
                <option value="">Nenhuma</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Descricao</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descreva o produto..." className={`${inputClass} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Preco (R$)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Preco original (opcional)</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0.00" step="0.01" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Material</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Ex: Couro italiano" className={inputClass} />
            </div>

            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Cuidados</label>
              <textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} rows={3} placeholder="Instrucoes de cuidado do produto..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-4">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest">Tamanhos de calcado</h3>
            <div className="flex flex-wrap gap-2">
              {SHOE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`w-11 h-11 rounded-xl text-[13px] font-medium transition-all border ${
                    sizes.includes(size)
                      ? 'bg-[#C8A24D]/[0.08] text-[#D4AD4E] border-[#C8A24D]/[0.2]'
                      : 'bg-[#080808] text-[#555] border-[#181818] hover:text-white hover:border-[#222]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest pt-2">Tamanhos de roupa</h3>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 h-11 rounded-xl text-[13px] font-medium transition-all border ${
                    sizes.includes(size)
                      ? 'bg-[#C8A24D]/[0.08] text-[#D4AD4E] border-[#C8A24D]/[0.2]'
                      : 'bg-[#080808] text-[#555] border-[#181818] hover:text-white hover:border-[#222]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-4">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest">Fotos do produto</h3>
            <MultiImageUpload values={images} onChange={setImages} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-4">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest">Visibilidade</h3>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Em estoque</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${inStock ? 'bg-emerald-500/20' : 'bg-[#181818]'}`} onClick={() => setInStock(!inStock)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${inStock ? 'left-5 bg-emerald-400' : 'left-1 bg-[#444]'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Destaque</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-[#C8A24D]/20' : 'bg-[#181818]'}`} onClick={() => setIsFeatured(!isFeatured)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isFeatured ? 'left-5 bg-[#C8A24D]' : 'left-1 bg-[#444]'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Novidade</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${isNew_ ? 'bg-blue-500/20' : 'bg-[#181818]'}`} onClick={() => setIsNew_(!isNew_)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isNew_ ? 'left-5 bg-blue-400' : 'left-1 bg-[#444]'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Best Seller</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${isBestseller ? 'bg-amber-500/20' : 'bg-[#181818]'}`} onClick={() => setIsBestseller(!isBestseller)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isBestseller ? 'left-5 bg-amber-400' : 'left-1 bg-[#444]'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Pronta entrega</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${prontaEntrega ? 'bg-cyan-500/20' : 'bg-[#181818]'}`} onClick={() => setProntaEntrega(!prontaEntrega)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${prontaEntrega ? 'left-5 bg-cyan-400' : 'left-1 bg-[#444]'}`} />
              </div>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name || !price}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-[#C8A24D]/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Criar Produto' : 'Salvar Alteracoes'}
          </button>

          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff5555]/[0.06] text-[#ff5555]/80 text-[13px] rounded-xl border border-[#ff5555]/[0.1] hover:bg-[#ff5555]/[0.1] transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir Produto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
