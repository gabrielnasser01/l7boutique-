'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: string;
}

export function ImageUpload({ value, onChange, folder = 'products', className = '', aspectRatio = 'aspect-square' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (!error) {
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      onChange(data.publicUrl);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={`relative group ${className}`}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {value ? (
        <div className={`relative ${aspectRatio} rounded-xl overflow-hidden bg-[#141414] border border-[#1c1c1c]`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="p-2 bg-white/10 backdrop-blur rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </button>
            <button
              onClick={() => onChange('')}
              className="p-2 bg-white/10 backdrop-blur rounded-xl text-white hover:bg-[#ff5555]/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${aspectRatio} rounded-xl border-2 border-dashed border-[#1c1c1c] bg-[#0e0e0e] flex flex-col items-center justify-center gap-2 hover:border-[#C8A24D]/30 hover:bg-[#111] transition-all cursor-pointer`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-[#444]" />
              <span className="text-[11px] text-[#444]">Adicionar foto</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  max?: number;
}

export function MultiImageUpload({ values, onChange, folder = 'products', max = 6 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (values.length + newUrls.length >= max) break;
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (!error) {
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }

    onChange([...values, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeImage(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    const arr = [...values];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
      <div className="grid grid-cols-3 gap-3">
        {values.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group aspect-square rounded-xl overflow-hidden bg-[#141414] border border-[#1c1c1c]">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 text-[9px] bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black px-2 py-0.5 rounded-md font-semibold">CAPA</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {i > 0 && (
                <button onClick={() => moveImage(i, i - 1)} className="p-1.5 bg-white/10 rounded-lg text-white text-xs hover:bg-white/20">&#8592;</button>
              )}
              <button onClick={() => removeImage(i)} className="p-1.5 bg-[#ff5555]/30 rounded-lg text-white hover:bg-[#ff5555]/50">
                <X className="w-3.5 h-3.5" />
              </button>
              {i < values.length - 1 && (
                <button onClick={() => moveImage(i, i + 1)} className="p-1.5 bg-white/10 rounded-lg text-white text-xs hover:bg-white/20">&#8594;</button>
              )}
            </div>
          </div>
        ))}
        {values.length < max && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-[#1c1c1c] bg-[#0e0e0e] flex flex-col items-center justify-center gap-1.5 hover:border-[#C8A24D]/30 hover:bg-[#111] transition-all cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#C8A24D]" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-[#444]" />
                <span className="text-[10px] text-[#444]">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
