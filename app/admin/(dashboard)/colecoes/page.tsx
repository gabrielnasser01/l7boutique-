'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
import { Collection } from '@/lib/types';
import {
  Search, Loader2, Plus, FolderOpen, Pencil, Trash2, Save, Star, StarOff,
} from 'lucide-react';

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface CollectionFormData {
  name: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  sort_order: string;
}

const emptyForm: CollectionFormData = {
  name: '', description: '', image_url: '', is_featured: false, sort_order: '0',
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<CollectionFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    const { data } = await supabase.from('collections').select('*').order('sort_order');
    setCollections((data as Collection[]) || []);
    setLoading(false);
  }

  function startEdit(col: Collection) {
    setEditingId(col.id);
    setShowNew(false);
    setForm({
      name: col.name,
      description: col.description,
      image_url: col.image_url,
      is_featured: col.is_featured,
      sort_order: col.sort_order.toString(),
    });
  }

  function startNew() {
    setShowNew(true);
    setEditingId(null);
    setForm(emptyForm);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: generateSlug(form.name),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      is_featured: form.is_featured,
      sort_order: parseInt(form.sort_order) || 0,
    };

    try {
      await adminApi.writeCollection(payload, editingId);
      await loadCollections();
      cancelEdit();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(col: Collection) {
    if (!confirm(`Excluir a colecao "${col.name}"? Produtos vinculados podem ser afetados.`)) return;
    try {
      await adminApi.deleteCollection(col.id);
      setCollections((prev) => prev.filter((c) => c.id !== col.id));
    } catch { /* */ }
  }

  async function toggleFeatured(col: Collection) {
    const newVal = !col.is_featured;
    await adminApi.writeCollection({ is_featured: newVal }, col.id);
    setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, is_featured: newVal } : c));
  }

  const filtered = collections.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const inputClass = 'w-full px-4 py-2.5 bg-[#080808] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  const formSection = (title: string) => (
    <div className="bg-[#0e0e0e] border border-[#C8A24D]/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-[11px] font-semibold text-[#C8A24D] uppercase tracking-widest">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Nome</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Inverno 2026" className={inputClass} />
        </div>
        <div>
          <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Imagem URL</label>
          <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Descricao</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descreva a colecao..." className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Ordem</label>
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className={inputClass} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer group pb-2.5">
            <div className={`w-10 h-6 rounded-full transition-colors relative ${form.is_featured ? 'bg-[#C8A24D]/20' : 'bg-[#181818]'}`} onClick={() => setForm({ ...form, is_featured: !form.is_featured })}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${form.is_featured ? 'left-5 bg-[#C8A24D]' : 'left-1 bg-[#444]'}`} />
            </div>
            <span className="text-[13px] text-[#777] group-hover:text-white transition-colors">Destaque</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black text-[13px] font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </button>
        <button onClick={cancelEdit} className="px-5 py-2.5 text-[13px] text-[#666] hover:text-white rounded-xl border border-[#181818] hover:border-[#222] transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Gerenciamento</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Colecoes</h1>
          <p className="text-[13px] text-[#555] mt-1">{collections.length} colecao{collections.length !== 1 ? 'es' : ''}</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all self-start shadow-md shadow-[#C8A24D]/10"
        >
          <Plus className="w-4 h-4" />
          Nova Colecao
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
        <input
          type="text"
          placeholder="Buscar colecao..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors"
        />
      </div>

      {showNew && formSection('Nova Colecao')}

      {filtered.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl flex flex-col items-center justify-center py-20 text-[#444]">
          <FolderOpen className="w-10 h-10 mb-3 text-[#2a2a2a]" />
          <p className="text-[13px]">Nenhuma colecao encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((col) => (
            <div key={col.id}>
              {editingId === col.id ? formSection('Editar Colecao') : (
                <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl hover:border-[#222] transition-all duration-200 overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {col.image_url ? (
                      <div className="w-16 h-16 rounded-xl bg-[#141414] bg-cover bg-center flex-shrink-0 border border-[#1c1c1c]" style={{ backgroundImage: `url(${col.image_url})` }} />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#141414] border border-[#1c1c1c] flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-6 h-6 text-[#333]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-medium text-white">{col.name}</h3>
                        {col.is_featured && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#C8A24D]/[0.06] text-[#C8A24D] rounded-md border border-[#C8A24D]/[0.12]">Destaque</span>
                        )}
                      </div>
                      {col.description && <p className="text-[11px] text-[#555] mt-0.5 truncate">{col.description}</p>}
                      <p className="text-[11px] text-[#444] mt-0.5 font-mono">{col.slug}</p>
                    </div>
                    <span className="text-[10px] text-[#444] font-mono px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#141414]">#{col.sort_order}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleFeatured(col)} className={`p-2 rounded-lg transition-colors ${col.is_featured ? 'text-[#C8A24D]/80 hover:bg-[#C8A24D]/[0.04]' : 'text-[#444] hover:text-[#C8A24D] hover:bg-[#C8A24D]/[0.04]'}`}>
                        {col.is_featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => startEdit(col)} className="p-2 rounded-lg text-[#444] hover:text-[#C8A24D] hover:bg-[#C8A24D]/[0.06] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(col)} className="p-2 rounded-lg text-[#444] hover:text-[#ff5555] hover:bg-[#ff5555]/[0.04] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
