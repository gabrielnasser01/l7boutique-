export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatInstallments(price: number, installments: number = 6): string {
  const value = price / installments;
  return `${installments}x de ${formatPrice(value)}`;
}
