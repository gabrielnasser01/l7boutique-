import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkPaymentStatus } from '@/lib/infinitepay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionNsu, slug } = body as {
      orderId?: string;
      transactionNsu?: string;
      slug?: string;
    };

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: 'orderId obrigatorio' },
        { status: 400 }
      );
    }

    const result = await checkPaymentStatus({
      orderId,
      transactionNsu,
      slug,
    });

    const isPaid =
      result.status === 'paid' ||
      result.payment_status === 'paid' ||
      result.approved === true;

    if (isPaid) {
      await supabase.rpc('payment_update_order', {
        p_order_id: orderId,
        p_data: {
          payment_status: 'paid',
          status: 'confirmed',
          transaction_nsu: result.transaction_nsu || transactionNsu || '',
        },
      });
    }

    return NextResponse.json({ ok: true, paid: isPaid, raw: result });
  } catch (err) {
    console.error('[PaymentCheck] Exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao verificar pagamento' },
      { status: 500 }
    );
  }
}
