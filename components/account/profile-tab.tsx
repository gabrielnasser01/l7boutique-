'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useUserAuth } from '@/contexts/user-auth-context';

export function ProfileTab() {
  const { user, profile, updateProfile } = useUserAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCpf(profile.cpf || '');
      setBirthDate(profile.birth_date || '');
    }
  }, [profile]);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);

    const result = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      cpf: cpf.trim(),
      birth_date: birthDate || null,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const inputClass = 'w-full h-12 px-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors';
  const labelClass = 'block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2';

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-serif text-charcoal font-light mb-8">Meus Dados</h2>

      {error && (
        <div className="mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-[12px] font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className={`${inputClass} bg-charcoal/[0.03] text-charcoal/40 cursor-not-allowed`}
          />
          <p className="text-[10px] font-sans text-charcoal/30 mt-1">O e-mail nao pode ser alterado</p>
        </div>

        <div>
          <label className={labelClass}>Nome Completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Seu nome completo"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              className={inputClass}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Data de Nascimento</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="h-12 px-10 flex items-center justify-center gap-2 bg-charcoal text-ivory border border-charcoal text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border border-ivory/30 border-t-ivory rounded-full animate-spin" />
            ) : saved ? (
              <>
                <Check size={14} strokeWidth={1.5} />
                SALVO
              </>
            ) : (
              'SALVAR ALTERACOES'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
