'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Star, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserAuth } from '@/contexts/user-auth-context';

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
}

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
  label: 'Casa',
  recipient_name: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  is_default: false,
};

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export function AddressesTab() {
  const { user } = useUserAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data) setAddresses(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
    setShowForm(true);
    setError('');
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      recipient_name: addr.recipient_name,
      cep: addr.cep,
      street: addr.street,
      number: addr.number,
      complement: addr.complement,
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      is_default: addr.is_default,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (!form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) {
      setError('Preencha os campos obrigatorios.');
      return;
    }

    setSaving(true);

    if (form.is_default) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    if (editingId) {
      const { error: err } = await supabase
        .from('user_addresses')
        .update(form)
        .eq('id', editingId);
      if (err) setError('Erro ao atualizar endereco.');
    } else {
      const { error: err } = await supabase
        .from('user_addresses')
        .insert({ ...form, user_id: user.id });
      if (err) setError('Erro ao salvar endereco.');
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      fetchAddresses();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('user_addresses').delete().eq('id', id);
    fetchAddresses();
  }

  async function handleSetDefault(id: string) {
    if (!user) return;
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
    await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', id);
    fetchAddresses();
  }

  const inputClass = 'w-full h-11 px-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors';
  const labelClass = 'block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-1.5';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-serif text-charcoal font-light">Enderecos</h2>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 h-10 px-5 border border-charcoal/15 text-[11px] tracking-boutique font-sans uppercase text-charcoal/60 hover:border-charcoal/30 hover:text-charcoal transition-all"
          >
            <Plus size={14} strokeWidth={1.5} />
            Novo Endereco
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-charcoal/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-sans text-charcoal font-medium">
                {editingId ? 'Editar Endereco' : 'Novo Endereco'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-charcoal/30 hover:text-charcoal transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 text-[12px] font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Etiqueta</label>
                  <select
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Destinatario</label>
                  <input
                    type="text"
                    value={form.recipient_name}
                    onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                    className={inputClass}
                    placeholder="Nome do destinatario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: formatCep(e.target.value) })}
                    className={inputClass}
                    placeholder="00000-000"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Rua *</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className={inputClass}
                    placeholder="Nome da rua"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Numero *</label>
                  <input
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className={inputClass}
                    placeholder="123"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Complemento</label>
                  <input
                    type="text"
                    value={form.complement}
                    onChange={(e) => setForm({ ...form, complement: e.target.value })}
                    className={inputClass}
                    placeholder="Apto, bloco, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    className={inputClass}
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputClass}
                    placeholder="Cidade"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Estado *</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="">UF</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 border border-charcoal/20 accent-charcoal"
                />
                <span className="text-[12px] font-sans text-charcoal/60">Definir como endereco principal</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-8 flex items-center justify-center gap-2 bg-charcoal text-ivory border border-charcoal text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border border-ivory/30 border-t-ivory rounded-full animate-spin" />
                  ) : (
                    'SALVAR'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-11 px-8 border border-charcoal/15 text-[11px] tracking-boutique font-sans uppercase text-charcoal/50 hover:border-charcoal/30 transition-all"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </motion.div>
        ) : addresses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-charcoal/10"
          >
            <MapPin size={32} strokeWidth={1} className="mx-auto text-charcoal/15 mb-4" />
            <p className="text-[13px] font-sans text-charcoal/30">Nenhum endereco cadastrado</p>
            <button
              onClick={openNew}
              className="mt-4 text-[11px] tracking-boutique font-sans uppercase text-gold hover:text-gold-dark transition-colors"
            >
              Adicionar Endereco
            </button>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-3">
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                className="border border-charcoal/10 p-5 flex items-start justify-between gap-4 hover:border-charcoal/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-sans font-medium text-charcoal">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-[9px] tracking-boutique font-sans uppercase text-gold bg-gold/10 px-2 py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                  {addr.recipient_name && (
                    <p className="text-[12px] font-sans text-charcoal/50 mb-0.5">{addr.recipient_name}</p>
                  )}
                  <p className="text-[12px] font-sans text-charcoal/60">
                    {addr.street}, {addr.number}
                    {addr.complement && ` - ${addr.complement}`}
                  </p>
                  <p className="text-[12px] font-sans text-charcoal/40">
                    {addr.neighborhood && `${addr.neighborhood}, `}
                    {addr.city} - {addr.state}
                    {addr.cep && ` | CEP: ${addr.cep}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="p-2 text-charcoal/20 hover:text-gold transition-colors"
                      title="Definir como principal"
                    >
                      <Star size={15} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="text-[10px] tracking-boutique font-sans uppercase text-charcoal/30 hover:text-charcoal transition-colors px-2 py-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-charcoal/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MapPin(props: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
