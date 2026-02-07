import { OrderStatus, PaymentMethod, PaymentStatus } from './types';

export const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-400', bg: 'bg-amber-400/[0.06] border-amber-400/[0.12]' },
  confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-400/[0.06] border-blue-400/[0.12]' },
  shipped: { label: 'Enviado', color: 'text-cyan-400', bg: 'bg-cyan-400/[0.06] border-cyan-400/[0.12]' },
  delivered: { label: 'Entregue', color: 'text-emerald-400', bg: 'bg-emerald-400/[0.06] border-emerald-400/[0.12]' },
  cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/[0.06] border-red-400/[0.12]' },
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartao',
  boleto: 'Boleto',
};

export const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-400' },
  paid: { label: 'Pago', color: 'text-emerald-400' },
  refunded: { label: 'Reembolsado', color: 'text-red-400' },
};

export function formatDateBR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTimeBR(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
