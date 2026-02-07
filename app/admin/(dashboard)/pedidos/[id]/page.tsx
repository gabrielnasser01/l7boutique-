'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { statusConfig, paymentMethodLabels, paymentStatusConfig, formatDateTimeBR } from '@/lib/admin-helpers';
import {
  ArrowLeft, Loader2, Truck, CreditCard, MapPin, FileText,
  CheckCircle2, Clock, XCircle, Package, Send,
} from 'lucide-react';

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await adminApi.readOrderDetail(params.id as string);
      setOrder(data as Order | null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function updateStatus(newStatus: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    const updateData: Record<string, string> = { status: newStatus };
    if (newStatus === 'cancelled') updateData.payment_status = 'refunded';
    await adminApi.updateOrder(order.id, updateData);
    setOrder({ ...order, status: newStatus, payment_status: newStatus === 'cancelled' ? 'refunded' : order.payment_status });
    setUpdating(false);
  }

  async function updateTracking(code: string) {
    if (!order) return;
    await adminApi.updateOrder(order.id, { tracking_code: code });
    setOrder({ ...order, tracking_code: code });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" /></div>;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#444]">
        <Package className="w-10 h-10 mb-3 text-[#2a2a2a]" />
        <p className="text-[13px]">Pedido nao encontrado</p>
        <Link href="/admin/pedidos" className="text-[13px] text-[#C8A24D] mt-3">Voltar aos pedidos</Link>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const payStatus = paymentStatusConfig[order.payment_status];
  const currentStepIndex = statusFlow.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/pedidos')} className="p-2.5 rounded-xl bg-[#0e0e0e] border border-[#181818] text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white tracking-tight">{order.order_number}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-lg ${status.bg} ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-[13px] text-[#555] mt-0.5 font-mono">{formatDateTimeBR(order.created_at)}</p>
        </div>
      </div>

      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
          <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-5">Progresso</h3>
          <div className="flex items-center gap-2">
            {statusFlow.map((s, i) => {
              const stepConfig = statusConfig[s];
              const isComplete = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all flex-shrink-0 ${isComplete ? 'border-[#C8A24D]/40 bg-[#C8A24D]/[0.06]' : 'border-[#1c1c1c] bg-[#080808]'}`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4 text-[#C8A24D]" /> : <Clock className="w-3.5 h-3.5 text-[#333]" />}
                  </div>
                  <span className={`text-[11px] hidden sm:block ${isCurrent ? 'text-[#D4AD4E] font-medium' : isComplete ? 'text-[#777]' : 'text-[#333]'}`}>{stepConfig.label}</span>
                  {i < statusFlow.length - 1 && <div className={`flex-1 h-px ${i < currentStepIndex ? 'bg-[#C8A24D]/30' : 'bg-[#181818]'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-4">Itens do pedido</h3>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-[#080808] rounded-xl border border-[#141414]">
                  <div className="w-14 h-14 rounded-xl bg-[#141414] bg-cover bg-center flex-shrink-0 border border-[#1c1c1c]" style={{ backgroundImage: item.product_image ? `url(${item.product_image})` : undefined }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white font-medium truncate">{item.product_name}</p>
                    <p className="text-[11px] text-[#555] mt-0.5">Tam: {item.size} &middot; Qtd: {item.quantity}</p>
                  </div>
                  <p className="text-[13px] font-medium text-white flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#141414] space-y-2">
              <div className="flex justify-between text-[13px]"><span className="text-[#555]">Subtotal</span><span className="text-[#777]">{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-[13px]"><span className="text-[#555]">Desconto</span><span className="text-emerald-400">-{formatPrice(order.discount)}</span></div>}
              {order.shipping_cost > 0 && <div className="flex justify-between text-[13px]"><span className="text-[#555]">Frete</span><span className="text-[#777]">{formatPrice(order.shipping_cost)}</span></div>}
              <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-[#141414]"><span className="text-white">Total</span><span className="text-[#C8A24D]">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
              <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-4">Rastreio</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="Codigo de rastreio..." defaultValue={order.tracking_code || ''} onBlur={(e) => updateTracking(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#080808] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors" />
                <button className="p-2.5 bg-[#141414] border border-[#1c1c1c] rounded-xl text-[#666] hover:text-white transition-colors"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" />Pagamento</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]"><span className="text-[#555]">Metodo</span><span className="text-white">{paymentMethodLabels[order.payment_method]}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-[#555]">Status</span><span className={payStatus.color}>{payStatus.label}</span></div>
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
            <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Cliente</h3>
            {order.customers && (
              <div className="space-y-2">
                <p className="text-[13px] text-white font-medium">{order.customers.name}</p>
                {order.customers.phone && <p className="text-[13px] text-[#777]">{order.customers.phone}</p>}
                {order.customers.email && <p className="text-[13px] text-[#777]">{order.customers.email}</p>}
                {order.customers.cpf && <p className="text-[13px] text-[#777]">CPF: {order.customers.cpf}</p>}
              </div>
            )}
          </div>

          {order.shipping_street && (
            <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
              <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-4 flex items-center gap-2"><Truck className="w-3.5 h-3.5" />Endereco de Entrega</h3>
              <div className="space-y-1.5">
                <p className="text-[13px] text-white font-medium">{order.shipping_name}</p>
                <p className="text-[13px] text-[#777]">
                  {order.shipping_street}, {order.shipping_number}
                  {order.shipping_complement ? ` - ${order.shipping_complement}` : ''}
                </p>
                <p className="text-[13px] text-[#777]">{order.shipping_neighborhood}</p>
                <p className="text-[13px] text-[#777]">{order.shipping_city} - {order.shipping_state}</p>
                <p className="text-[13px] text-[#777]">CEP: {order.shipping_cep}</p>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6">
              <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-3 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Observacoes</h3>
              <p className="text-[13px] text-[#777] leading-relaxed">{order.notes}</p>
            </div>
          )}

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="bg-[#0e0e0e] border border-[#181818] rounded-2xl p-6 space-y-3">
              <h3 className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-2">Acoes</h3>
              {order.status === 'pending' && (
                <button onClick={() => updateStatus('confirmed')} disabled={updating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/[0.06] text-blue-400 text-[13px] font-medium rounded-xl border border-blue-500/[0.12] hover:bg-blue-500/[0.1] transition-colors disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" />Confirmar Pedido
                </button>
              )}
              {order.status === 'confirmed' && (
                <button onClick={() => updateStatus('shipped')} disabled={updating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/[0.06] text-cyan-400 text-[13px] font-medium rounded-xl border border-cyan-500/[0.12] hover:bg-cyan-500/[0.1] transition-colors disabled:opacity-50">
                  <Truck className="w-4 h-4" />Marcar como Enviado
                </button>
              )}
              {order.status === 'shipped' && (
                <button onClick={() => updateStatus('delivered')} disabled={updating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/[0.06] text-emerald-400 text-[13px] font-medium rounded-xl border border-emerald-500/[0.12] hover:bg-emerald-500/[0.1] transition-colors disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" />Marcar como Entregue
                </button>
              )}
              <button onClick={() => updateStatus('cancelled')} disabled={updating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff5555]/[0.06] text-[#ff5555]/80 text-[13px] font-medium rounded-xl border border-[#ff5555]/[0.1] hover:bg-[#ff5555]/[0.1] transition-colors disabled:opacity-50">
                <XCircle className="w-4 h-4" />Cancelar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
