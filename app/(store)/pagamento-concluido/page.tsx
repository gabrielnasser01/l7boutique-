'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

type Status = 'loading' | 'pending' | 'paid' | 'not_found';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
}

export default function PaymentCompletePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<OrderData | null>(null);
  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('not_found');
      return;
    }

    async function checkOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (!data.ok || !data.order) {
          setStatus('not_found');
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        setOrder(data.order);

        if (data.order.payment_status === 'paid') {
          setStatus('paid');
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        setStatus('pending');
        pollCount.current += 1;

        if (pollCount.current >= 10) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        if (pollCount.current === 0) setStatus('not_found');
      }
    }

    checkOrder();
    intervalRef.current = setInterval(checkOrder, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto px-6 py-20 lg:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'loading' && (
          <div>
            <Loader2 size={40} strokeWidth={1} className="mx-auto text-charcoal/20 mb-6 animate-spin" />
            <p className="text-[14px] font-serif text-charcoal/60">Verificando pagamento...</p>
          </div>
        )}

        {status === 'pending' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={24} strokeWidth={1.5} className="text-amber-500 animate-spin" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif text-charcoal mb-3">Confirmando pagamento...</h1>
            <p className="text-[13px] font-sans text-charcoal/40 leading-relaxed mb-2">
              Estamos aguardando a confirmacao do seu pagamento. Isso pode levar alguns instantes.
            </p>
            {order && (
              <p className="text-[12px] font-sans text-charcoal/30 mt-4">
                Pedido: {order.order_number}
              </p>
            )}
          </div>
        )}

        {status === 'paid' && (
          <div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={28} strokeWidth={1.5} className="text-emerald-500" />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-serif text-charcoal mb-3">Pagamento aprovado!</h1>
            <p className="text-[13px] font-sans text-charcoal/40 leading-relaxed mb-2">
              Seu pedido foi confirmado com sucesso. Voce recebera atualizacoes sobre o envio.
            </p>
            {order && (
              <div className="mt-6 p-6 border border-charcoal/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-boutique font-sans text-charcoal/40 uppercase">Pedido</span>
                  <span className="text-[14px] font-serif text-charcoal">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-boutique font-sans text-charcoal/40 uppercase">Total</span>
                  <span className="text-[14px] font-serif text-charcoal">{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/rastreio`}
                className="text-[11px] tracking-boutique font-sans text-ivory bg-charcoal px-8 py-3.5 uppercase hover:bg-charcoal/90 transition-colors"
              >
                RASTREAR PEDIDO
              </Link>
              <Link
                href="/loja"
                className="text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-8 py-3.5 uppercase hover:bg-charcoal hover:text-ivory transition-colors"
              >
                CONTINUAR COMPRANDO
              </Link>
            </div>
          </div>
        )}

        {status === 'not_found' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
              <XCircle size={28} strokeWidth={1} className="text-charcoal/30" />
            </div>
            <h1 className="text-2xl font-serif text-charcoal mb-3">Pedido nao encontrado</h1>
            <p className="text-[13px] font-sans text-charcoal/40 leading-relaxed mb-8">
              Nao foi possivel localizar seu pedido. Se voce realizou um pagamento, entre em contato conosco.
            </p>
            <Link
              href="/"
              className="text-[11px] tracking-boutique font-sans text-charcoal border border-charcoal px-8 py-3.5 uppercase hover:bg-charcoal hover:text-ivory transition-colors"
            >
              VOLTAR AO INICIO
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
