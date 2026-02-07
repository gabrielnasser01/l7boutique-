const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE || 'isaaclucetti';
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CHECKOUT_LINKS_URL = 'https://api.infinitepay.io/invoices/public/checkout/links';
const PAYMENT_CHECK_URL = 'https://api.infinitepay.io/invoices/public/checkout/payment_check';

export interface InfinitePayItem {
  quantity: number;
  price: number;
  description: string;
}

export interface CreateCheckoutLinkParams {
  orderId: string;
  items: InfinitePayItem[];
}

export function extractCheckoutUrl(data: Record<string, unknown>): string | null {
  const keys = ['url', 'checkout_url', 'link', 'checkoutLink', 'checkout_link', 'payment_url'];
  for (const key of keys) {
    if (typeof data[key] === 'string' && (data[key] as string).startsWith('http')) {
      return data[key] as string;
    }
  }
  if (typeof data.data === 'object' && data.data !== null) {
    return extractCheckoutUrl(data.data as Record<string, unknown>);
  }
  return null;
}

export async function createCheckoutLink({ orderId, items }: CreateCheckoutLinkParams) {
  const body = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: orderId,
    redirect_url: `${APP_URL}/pagamento-concluido?orderId=${orderId}`,
    webhook_url: `${APP_URL}/api/payments/infinitepay/webhook`,
    items: items.map((i) => ({
      quantity: i.quantity,
      price: i.price,
      description: i.description,
    })),
  };

  const res = await fetch(CHECKOUT_LINKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false as const, error: data };
  }

  const checkoutUrl = extractCheckoutUrl(data);

  return checkoutUrl
    ? { ok: true as const, checkoutUrl }
    : { ok: false as const, error: data, raw: data };
}

export async function checkPaymentStatus(params: {
  orderId: string;
  transactionNsu?: string;
  slug?: string;
}) {
  const body: Record<string, string> = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: params.orderId,
  };
  if (params.transactionNsu) body.transaction_nsu = params.transactionNsu;
  if (params.slug) body.slug = params.slug;

  const res = await fetch(PAYMENT_CHECK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
}
