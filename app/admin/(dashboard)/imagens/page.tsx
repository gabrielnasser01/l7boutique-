'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
import { Category, SiteImage } from '@/lib/types';
import { ImageUpload } from '@/components/admin/image-upload';
import { Loader2, Save, Plus, Trash2, GripVertical, Check } from 'lucide-react';

type Section = 'hero' | 'categorias' | 'destaque';

const sectionLabels: Record<Section, string> = {
  hero: 'Banner Principal',
  categorias: 'Categorias',
  destaque: 'Secao Destaque',
};

export default function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<SiteImage[]>([]);
  const [spotlight, setSpotlight] = useState<SiteImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('hero');

  useEffect(() => {
    async function load() {
      const [catRes, heroRes, spotRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('site_images').select('*').eq('section', 'hero').order('sort_order'),
        supabase.from('site_images').select('*').eq('section', 'homepage').eq('image_key', 'category_spotlight').maybeSingle(),
      ]);
      setCategories((catRes.data as Category[]) || []);
      setHeroSlides((heroRes.data as SiteImage[]) || []);
      if (spotRes.data) setSpotlight(spotRes.data as SiteImage);
      setLoading(false);
    }
    load();
  }, []);

  async function updateCategoryImage(cat: Category, imageUrl: string) {
    setSaving(cat.id);
    await adminApi.updateCategory(cat.id, { image_url: imageUrl });
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, image_url: imageUrl } : c));
    setSaving(null);
  }

  async function updateHeroSlide(slide: SiteImage, updates: Partial<SiteImage>) {
    setSaving(slide.id);
    await adminApi.writeSiteImage(updates, slide.id);
    setHeroSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, ...updates } : s));
    setSaving(null);
  }

  async function addHeroSlide() {
    const key = `slide-${Date.now()}`;
    const result = await adminApi.writeSiteImage({
      section: 'hero',
      image_key: key,
      image_url: '',
      title: 'Novo Slide',
      subtitle: 'SUBTITULO',
      link_url: '/loja',
      sort_order: heroSlides.length,
    });
    if (result) setHeroSlides((prev) => [...prev, result as unknown as SiteImage]);
  }

  async function deleteHeroSlide(slide: SiteImage) {
    if (!confirm('Excluir este slide?')) return;
    await adminApi.deleteSiteImage(slide.id);
    setHeroSlides((prev) => prev.filter((s) => s.id !== slide.id));
  }

  async function updateSpotlight(updates: Partial<SiteImage>) {
    if (!spotlight) return;
    setSaving('spotlight');
    await adminApi.writeSiteImage(updates, spotlight.id);
    setSpotlight((prev) => prev ? { ...prev, ...updates } : prev);
    setSaving(null);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-[#080808] border border-[#181818] rounded-xl text-[13px] text-white focus:outline-none focus:border-[#C8A24D]/30 transition-colors';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest mb-1">Configuracao</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Imagens do Site</h1>
        <p className="text-[13px] text-[#555] mt-1">Gerencie os banners, fotos e secoes da homepage</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['hero', 'categorias', 'destaque'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border whitespace-nowrap ${
              activeSection === s
                ? 'bg-[#C8A24D]/[0.08] text-[#D4AD4E] border-[#C8A24D]/[0.15]'
                : 'bg-[#0e0e0e] text-[#666] border-[#181818] hover:text-[#aaa] hover:border-[#222]'
            }`}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      {activeSection === 'hero' && (
        <div className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div key={slide.id} className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#333]" />
                  <h3 className="text-[13px] font-medium text-white">Slide {i + 1}</h3>
                  {saving === slide.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A24D]" />}
                </div>
                <button onClick={() => deleteHeroSlide(slide)} className="p-1.5 text-[#444] hover:text-[#ff5555] rounded-lg hover:bg-[#ff5555]/[0.04] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <ImageUpload
                    value={slide.image_url}
                    onChange={(url) => updateHeroSlide(slide, { image_url: url })}
                    folder="banners"
                    aspectRatio="aspect-[16/9]"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[11px] text-[#555] mb-1 font-medium">Titulo</label>
                    <input type="text" defaultValue={slide.title} onBlur={(e) => updateHeroSlide(slide, { title: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#555] mb-1 font-medium">Subtitulo</label>
                    <input type="text" defaultValue={slide.subtitle} onBlur={(e) => updateHeroSlide(slide, { subtitle: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#555] mb-1 font-medium">Link</label>
                    <input type="text" defaultValue={slide.link_url} onBlur={(e) => updateHeroSlide(slide, { link_url: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addHeroSlide}
            className="w-full flex items-center justify-center gap-2 py-5 border-2 border-dashed border-[#1c1c1c] rounded-2xl text-[13px] text-[#555] hover:text-white hover:border-[#C8A24D]/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar Slide
          </button>
        </div>
      )}

      {activeSection === 'categorias' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-white">{cat.name}</h3>
                {saving === cat.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A24D]" />}
              </div>
              <ImageUpload
                value={cat.image_url}
                onChange={(url) => updateCategoryImage(cat, url)}
                folder="categories"
                aspectRatio="aspect-[3/4]"
              />
            </div>
          ))}
        </div>
      )}

      {activeSection === 'destaque' && spotlight && (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-medium text-white">Secao de Categoria na Homepage</h3>
            {saving === 'spotlight' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A24D]" />}
          </div>
          <p className="text-[12px] text-[#555] -mt-2">
            Escolha qual categoria aparece na secao de destaque da pagina inicial.
            Serao exibidos os 4 produtos mais recentes dessa categoria.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Categoria</label>
              <select
                value={spotlight.link_url}
                onChange={(e) => {
                  const cat = categories.find((c) => c.slug === e.target.value);
                  updateSpotlight({
                    link_url: e.target.value,
                    subtitle: cat?.name || e.target.value,
                  });
                }}
                className={inputClass}
              >
                <option value="">Nenhuma (secao oculta)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Titulo pequeno (acima)</label>
              <input
                type="text"
                defaultValue={spotlight.title}
                onBlur={(e) => updateSpotlight({ title: e.target.value })}
                placeholder="Ex: SNEAKERS"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#555] mb-1.5 font-medium">Titulo principal</label>
            <input
              type="text"
              defaultValue={spotlight.subtitle}
              onBlur={(e) => updateSpotlight({ subtitle: e.target.value })}
              placeholder="Ex: Tenis"
              className={inputClass}
            />
          </div>

          {spotlight.link_url && (
            <div className="bg-[#080808] border border-[#141414] rounded-xl p-4">
              <p className="text-[11px] text-[#555] mb-2">Preview:</p>
              <p className="text-[10px] tracking-widest text-[#C8A24D] uppercase">{spotlight.title}</p>
              <p className="text-xl font-light text-white mt-1">{spotlight.subtitle}</p>
              <p className="text-[11px] text-[#444] mt-2">
                Mostrando 4 produtos de: <span className="text-[#888]">{categories.find((c) => c.slug === spotlight.link_url)?.name || spotlight.link_url}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
