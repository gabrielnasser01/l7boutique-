import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const orderNsu = payload.order_nsu || payload.orderNsu || payload.nsu;
    if (!orderNsu) {
      console.error('[Webhook] Missing order_nsu in payload:', JSON.stringify(payload));
      return NextResponse.json({ ok: true });
    }

    const { data: order } = await supabase.rpc('public_find_order_for_payment', { p_nsu: orderNsu });

    if (!order) {
      console.error('[Webhook] Order not found for nsu:', orderNsu);
      return NextResponse.json({ ok: true });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ ok: true });
    }

    await supabase.rpc('payment_update_order', {
      p_order_id: order.id,
      p_data: {
        payment_status: 'paid',
        status: 'confirmed',
        transaction_nsu: payload.transaction_nsu || '',
        receipt_url: payload.receipt_url || '',
        capture_method: payload.capture_method || '',
        installments: payload.installments || 0,
        paid_amount: payload.paid_amount || payload.amount || 0,
        invoice_slug: payload.invoice_slug || payload.slug || '',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Webhook] Exception:', err);
    return NextResponse.json({ ok: true });
  }
}
