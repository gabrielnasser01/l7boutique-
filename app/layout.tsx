import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'L7 Boutique | Quiet Luxury',
  description: 'Curadoria de pecas atemporais. Tricos, outerwear e essenciais com qualidade premium e elegancia silenciosa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
