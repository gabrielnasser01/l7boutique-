'use client';

import { motion } from 'framer-motion';

const SECTIONS = [
  {
    id: 'privacidade',
    title: 'Politica de Privacidade',
    content: `A L7 Boutique valoriza a privacidade de seus clientes. Coletamos apenas os dados necessarios para processar seus pedidos e melhorar sua experiencia de compra.

Seus dados pessoais sao utilizados exclusivamente para:
- Processamento de pedidos e entregas
- Comunicacao sobre status de pedidos
- Envio de novidades e promocoes (quando autorizado)
- Melhoria continua dos nossos servicos

Nao compartilhamos seus dados com terceiros, exceto quando necessario para processamento de pagamentos e entregas. Todos os dados sao armazenados de forma segura e criptografada.

Voce pode solicitar a exclusao dos seus dados a qualquer momento entrando em contato conosco.`,
  },
  {
    id: 'termos',
    title: 'Termos de Uso',
    content: `Ao acessar e utilizar o site da L7 Boutique, voce concorda com os seguintes termos:

1. As imagens dos produtos podem apresentar pequenas variacoes de cor em relacao ao produto real, devido a configuracoes de tela.

2. Os precos podem ser alterados sem aviso previo. O preco valido e o exibido no momento da finalizacao da compra.

3. Reservamo-nos o direito de cancelar pedidos em caso de indisponibilidade de estoque, informando o cliente imediatamente.

4. Todo o conteudo do site (textos, imagens, design) e propriedade da L7 Boutique e nao pode ser reproduzido sem autorizacao.

5. A L7 Boutique nao se responsabiliza por atrasos causados por transportadoras ou eventos de forca maior.`,
  },
  {
    id: 'trocas',
    title: 'Trocas e Devolucoes',
    content: `Queremos que voce fique satisfeito com sua compra. Por isso, oferecemos as seguintes condicoes:

Prazo: Ate 30 dias apos o recebimento do produto.

Condicoes: A peca deve estar em perfeito estado, com etiquetas originais e sem sinais de uso.

Processo:
1. Entre em contato conosco informando o numero do pedido e o motivo da troca
2. Enviaremos um codigo de postagem para devolucao gratuita (primeira troca)
3. Apos recebimento e verificacao, enviaremos o novo produto ou realizaremos o reembolso
4. O reembolso e processado em ate 10 dias uteis

Para trocas subsequentes, o custo de envio sera do cliente.`,
  },
  {
    id: 'envio',
    title: 'Politica de Envio',
    content: `Trabalhamos para entregar suas pecas com seguranca e agilidade.

Prazos:
- Preparacao do pedido: ate 2 dias uteis apos confirmacao do pagamento
- Entrega: 3 a 10 dias uteis, dependendo da regiao

Frete:
- Gratis para compras acima de R$ 499
- Calculado no checkout para pedidos abaixo deste valor

Rastreamento:
- Apos o envio, voce recebera o codigo de rastreio por e-mail
- Acompanhe a entrega pela pagina de Rastreio do nosso site

Embalagem:
- Todas as pecas sao cuidadosamente embaladas em papel de seda com a identidade L7 Boutique
- Caixas premium com protecao adicional para garantir a integridade do produto`,
  },
];

export default function PoliciesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">Institucional</p>
          <h1 className="text-3xl lg:text-4xl font-serif text-charcoal font-light">Politicas</h1>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-2 mb-14">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-[10px] tracking-boutique font-sans text-charcoal/50 hover:text-charcoal border border-charcoal/15 hover:border-charcoal/40 px-4 py-2 uppercase transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-serif text-charcoal mb-6">{section.title}</h2>
              <div className="text-[14px] font-sans text-charcoal/60 leading-[1.8] whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
