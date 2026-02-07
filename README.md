# L7 Boutique

E-commerce de moda premium construido com Next.js, Supabase e Tailwind CSS.

Plataforma completa com loja, carrinho, checkout, painel administrativo e integracao de pagamento via InfinitePay.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 13 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + Radix UI |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticacao | Supabase Auth |
| Pagamento | InfinitePay (PIX, Cartao, Boleto) |
| Animacoes | Framer Motion |
| Deploy | Netlify |

---

## Funcionalidades

### Loja

- Catalogo com filtros por categoria, colecao e faixa de preco
- Paginas de produto com galeria de imagens, tamanhos e cores
- Carrinho de compras com calculo de frete
- Checkout com busca automatica de CEP (ViaCEP)
- Pagamento via InfinitePay (PIX com desconto, cartao parcelado, boleto)
- Rastreio de pedidos integrado com Correios
- Area do cliente com historico de pedidos e enderecos
- Secao de pronta entrega
- Colecoes tematicas
- FAQ e politicas de troca/devolucao

### Painel Administrativo

- Dashboard com metricas de vendas e receita
- Gestao de pedidos com filtros por status
- CRUD completo de produtos, categorias, colecoes e marcas
- Gestao de clientes com ranking por valor gasto
- Controle de imagens do site (banners, categorias, secao destaque)
- Graficos de vendas e produtos mais vendidos

---

## Estrutura do Projeto

```
app/
  (store)/          # Paginas da loja (home, loja, produto, carrinho, checkout...)
  admin/            # Painel administrativo
  api/              # API routes (pagamentos, pedidos)
components/
  home/             # Secoes da homepage
  layout/           # Header, footer, cart drawer, menu mobile
  admin/            # Componentes do painel admin
  account/          # Dashboard da conta do cliente
  shop/             # Filtros da loja
  ui/               # Componentes base (shadcn/ui)
contexts/           # Auth e carrinho (React Context)
hooks/              # Custom hooks
lib/                # Supabase client, tipos, utilitarios, API admin
supabase/
  migrations/       # Migrations do banco de dados
```

---

## Banco de Dados

| Tabela | Descricao |
|---|---|
| `products` | Catalogo de produtos com precos, imagens, tamanhos e cores |
| `categories` | Categorias (Tenis, Calcas, Camisetas, etc.) |
| `collections` | Colecoes tematicas |
| `brands` | Marcas dos produtos |
| `customers` | Dados dos clientes |
| `orders` | Pedidos com status e pagamento |
| `order_items` | Itens de cada pedido |
| `testimonials` | Depoimentos de clientes |
| `faq_items` | Perguntas frequentes |
| `admin_users` | Usuarios administrativos |
| `site_images` | Banners e imagens configuráveis do site |

Todas as tabelas possuem Row Level Security (RLS) habilitado.

---

## Variaveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
INFINITEPAY_API_KEY=
```

---

## Rodando Local

```bash
npm install
npm run dev
```

O servidor inicia em `http://localhost:3000`.

---

## Design

Paleta baseada em tons escuros com acentos dourados, tipografia serif (Cormorant Garamond) para titulos e sans-serif (Inter) para corpo de texto. Layout responsivo com foco em experiencia mobile.

| Cor | Hex |
|---|---|
| Charcoal | `#070707` |
| Ivory | `#F4F2EE` |
| Gold | `#C8A24D` |
| Gold Light | `#D4B66A` |
| Gold Dark | `#A6832E` |

---

## Licenca

Projeto privado -- todos os direitos reservados.
