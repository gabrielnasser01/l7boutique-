import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: order } = await supabase.rpc('public_get_order_basic', { p_order_id: params.id });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'Pedido nao encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error('[Orders] GET exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
