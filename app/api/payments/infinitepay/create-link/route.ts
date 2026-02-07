import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCheckoutLink } from '@/lib/infinitepay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ItemInput {
  quantity: number;
  priceCents: number;
  description: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, items } = body as { orderId?: string; items?: ItemInput[] };

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'orderId e items sao obrigatorios' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.description || item.quantity < 1 || item.priceCents < 0) {
        return NextResponse.json(
          { ok: false, error: 'Item invalido: quantity >= 1, priceCents >= 0, description obrigatorio' },
          { status: 400 }
        );
      }
    }

    const { data: existingOrder } = await supabase.rpc('public_get_order_basic', { p_order_id: orderId });

    if (!existingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Pedido nao encontrado' },
        { status: 404 }
      );
    }

    if (existingOrder.payment_status === 'paid') {
      return NextResponse.json(
        { ok: false, error: 'Pedido ja foi pago' },
        { status: 409 }
      );
    }

    await supabase.rpc('payment_update_order', {
      p_order_id: orderId,
      p_data: {
        payment_provider: 'infinitepay',
        order_nsu: orderId,
      },
    });

    const result = await createCheckoutLink({
      orderId,
      items: items.map((i) => ({
        quantity: i.quantity,
        price: i.priceCents,
        description: i.description,
      })),
    });

    if (result.ok) {
      return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl });
    }

    console.error('[InfinitePay] create-link error:', JSON.stringify(result.error));
    return NextResponse.json(
      { ok: false, error: 'Erro ao gerar link de pagamento', details: result.error },
      { status: 502 }
    );
  } catch (err) {
    console.error('[InfinitePay] create-link exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
