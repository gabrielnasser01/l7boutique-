import Link from 'next/link';

const FOOTER_LINKS = [
  {
    title: 'LOJA',
    links: [
      { href: '/loja', label: 'Todos os Produtos' },
      { href: '/loja?categoria=tenis', label: 'Tenis' },
      { href: '/colecoes', label: 'Colecoes' },
      { href: '/loja?destaque=novidades', label: 'Novidades' },
    ],
  },
  {
    title: 'AJUDA',
    links: [
      { href: '/faq', label: 'Perguntas Frequentes' },
      { href: '/rastreio', label: 'Rastrear Pedido' },
      { href: '/politicas#trocas', label: 'Trocas e Devolucoes' },
      { href: '/politicas#envio', label: 'Politica de Envio' },
    ],
  },
  {
    title: 'INSTITUCIONAL',
    links: [
      { href: '/politicas', label: 'Politica de Privacidade' },
      { href: '/politicas#termos', label: 'Termos de Uso' },
      { href: '/conta', label: 'Minha Conta' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          <div>
            <Link href="/" className="inline-flex flex-col items-start">
              <span className="text-4xl font-serif font-semibold text-ivory leading-none">L7</span>
              <span className="text-[9px] tracking-wide-boutique font-sans text-ivory/40 uppercase mt-1">Boutique</span>
            </Link>
            <p className="text-[13px] font-sans text-ivory/40 leading-relaxed mt-6 max-w-[260px]">
              Curadoria de pecas de luxo das maiores grifes do mundo. Hermes, Louis Vuitton, Gucci, Golden Goose e mais.
            </p>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] tracking-wide-boutique font-sans text-gold mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-sans text-ivory/40 hover:text-ivory transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ivory/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-sans text-ivory/30">
            &copy; {new Date().getFullYear()} L7 Boutique. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] tracking-boutique font-sans text-ivory/20 uppercase">
              100% Autentico
            </span>
            <span className="w-px h-3 bg-ivory/10" />
            <span className="text-[10px] tracking-boutique font-sans text-ivory/20 uppercase">
              Grifes Internacionais
            </span>
            <span className="w-px h-3 bg-ivory/10" />
            <span className="text-[10px] tracking-boutique font-sans text-ivory/20 uppercase">
              Curadoria de Luxo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
