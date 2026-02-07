'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, Lock, ShoppingBag, User, Mail, Phone,
  MapPin, Hash, Building, Home, Map,
} from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatInstallments } from '@/lib/format';

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupCEP = useCallback(async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch {
    } finally {
      setCepLoading(false);
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-charcoal/20 mb-6" />
        <h1 className="text-2xl font-serif text-charcoal mb-3">Seu carrinho esta vazio</h1>
        <p className="text-[13px] font-sans text-charcoal/40 mb-8">Adicione produtos antes de finalizar.</p>
        <Link
          href="/loja"
          className="inline-block text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-10 py-4 uppercase hover:bg-charcoal hover:text-ivory transition-colors duration-300"
        >
          EXPLORAR LOJA
        </Link>
      </div>
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cpfDigits = cpf.replace(/\D/g, '');
    const cepDigits = cep.replace(/\D/g, '');

    if (!name.trim() || !phone.trim() || cpfDigits.length !== 11) {
      setError('Nome, telefone e CPF valido sao obrigatorios.');
      return;
    }

    if (cepDigits.length !== 8 || !street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !state.trim()) {
      setError('Preencha o endereco completo para entrega.');
      return;
    }

    setLoading(true);

    try {
      const phoneDigits = phone.replace(/\D/g, '');

      const customerPayload = {
        name: name.trim(),
        email: email.trim() || '',
        phone: phoneDigits,
        cpf: cpfDigits,
        cep: cepDigits,
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
      };

      const orderPayload = {
        payment_method: 'pix',
        payment_provider: 'infinitepay',
        subtotal: totalPrice,
        discount: 0,
        shipping_cost: 0,
        total: totalPrice,
        shipping_cpf: cpfDigits,
        shipping_name: name.trim(),
        shipping_phone: phoneDigits,
        shipping_cep: cepDigits,
        shipping_street: street.trim(),
        shipping_number: number.trim(),
        shipping_complement: complement.trim(),
        shipping_neighborhood: neighborhood.trim(),
        shipping_city: city.trim(),
        shipping_state: state.trim(),
      };

      const itemsPayload = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || '',
        size: item.size,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { data: orderResult, error: rpcErr } = await supabase.rpc('checkout_create_order', {
        p_customer: customerPayload,
        p_order: orderPayload,
        p_items: itemsPayload,
      });

      if (rpcErr || !orderResult) {
        setError('Erro ao criar pedido.');
        setLoading(false);
        return;
      }

      const order = orderResult as { id: string; order_number: string };

      const infiniteItems = items.map((item) => ({
        quantity: item.quantity,
        priceCents: Math.round(item.product.price * 100),
        description: `${item.product.name} - ${item.size}`,
      }));

      const res = await fetch('/api/payments/infinitepay/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, items: infiniteItems }),
      });

      const result = await res.json();

      if (result.ok && result.checkoutUrl) {
        clearCart();
        window.location.href = result.checkoutUrl;
        return;
      }

      clearCart();
      router.push(`/pagamento-concluido?orderId=${order.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30";

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 lg:mb-14">
        <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Finalizar</p>
        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Checkout</h1>
      </div>

      <form onSubmit={handleCheckout}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase mb-6">
                Seus Dados
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo *"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Hash size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="CPF *"
                      required
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail (opcional)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Phone size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="Telefone / WhatsApp *"
                      required
                      inputMode="tel"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase mb-6">
                Endereco de Entrega
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <MapPin size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        setCep(formatted);
                        if (formatted.replace(/\D/g, '').length === 8) lookupCEP(formatted);
                      }}
                      placeholder="CEP *"
                      required
                      inputMode="numeric"
                      className={inputClass}
                    />
                    {cepLoading && (
                      <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gold" />
                    )}
                  </div>
                  <div className="sm:col-span-2 relative">
                    <Home size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua / Avenida *"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="relative">
                    <Hash size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Numero *"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Building size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Complemento"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2 relative">
                    <Map size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bairro *"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 relative">
                    <Building size={16} strokeWidth={1.5} className={iconClass} />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cidade *"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Map size={16} strokeWidth={1.5} className={iconClass} />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className={`${inputClass} ${!state ? 'text-charcoal/25' : ''} appearance-none`}
                    >
                      <option value="" disabled>UF *</option>
                      {STATES.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase mb-6">
                Itens do Pedido
              </h2>
              <div className="space-y-0">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color?.name || ''}`}
                    className="flex items-center gap-4 py-4 border-b border-charcoal/8"
                  >
                    <div className="w-16 h-20 bg-charcoal/5 flex-shrink-0 overflow-hidden">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-serif text-charcoal truncate">{item.product.name}</p>
                      <p className="text-[11px] font-sans text-charcoal/40 mt-0.5">
                        {item.size}{item.color ? ` / ${item.color.name}` : ''} / Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="text-[14px] font-sans text-charcoal flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="border border-charcoal/10 p-8 sticky top-28">
              <h3 className="text-[11px] tracking-wide-boutique font-sans text-charcoal uppercase mb-6">Resumo</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-sans text-charcoal/50">Subtotal</span>
                  <span className="text-[13px] font-sans text-charcoal">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-sans text-charcoal/50">Frete</span>
                  <span className="text-[13px] font-sans text-charcoal/50">
                    {totalPrice >= 499 ? 'Gratis' : 'Calculado no checkout'}
                  </span>
                </div>
              </div>

              <div className="border-t border-charcoal/10 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-sans text-charcoal font-medium">Total</span>
                  <span className="text-xl font-serif text-charcoal">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-[11px] font-sans text-charcoal/35 mt-1 text-right">
                  {formatInstallments(totalPrice)}
                </p>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] font-sans text-red-500 mb-4 text-center"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-charcoal text-ivory border border-charcoal text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} strokeWidth={1.5} />
                )}
                {loading ? 'PROCESSANDO...' : 'PAGAR COM INFINITEPAY'}
              </button>

              <p className="text-[10px] font-sans text-charcoal/30 text-center">
                Voce sera redirecionado para o checkout seguro da InfinitePay.
              </p>

              <div className="mt-6 pt-4 border-t border-charcoal/10">
                <Link
                  href="/carrinho"
                  className="flex items-center justify-center gap-2 text-[11px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal transition-colors uppercase"
                >
                  <ArrowLeft size={14} strokeWidth={1.5} />
                  VOLTAR AO CARRINHO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
