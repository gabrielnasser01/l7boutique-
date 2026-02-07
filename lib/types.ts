export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  category_id: string;
  collection_id: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  material: string;
  care_instructions: string;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  in_stock: boolean;
  brand: string;
  stock_quantity: number;
  pronta_entrega: boolean;
  created_at: string;
  categories?: Category;
  collections?: Collection;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_location: string;
  content: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor | null;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string | null;
  state: string | null;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'card' | 'boleto';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  tracking_code: string | null;
  notes: string | null;
  payment_provider: string | null;
  order_nsu: string | null;
  transaction_nsu: string | null;
  receipt_url: string | null;
  capture_method: string | null;
  installments: number | null;
  paid_amount: number | null;
  invoice_slug: string | null;
  shipping_cpf: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_cep: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface SiteImage {
  id: string;
  section: string;
  image_key: string;
  image_url: string;
  title: string;
  subtitle: string;
  link_url: string;
  sort_order: number;
  created_at: string;
}
