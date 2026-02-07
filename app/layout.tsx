import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'L7 Boutique | Quiet Luxury',
  description: 'Curadoria de pecas atemporais. Alfaiataria, tricos, outerwear e essenciais com qualidade premium e elegancia silenciosa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}
