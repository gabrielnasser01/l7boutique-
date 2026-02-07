'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product, ProductColor } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, color: ProductColor | null, quantity?: number) => void;
  removeItem: (productId: string, size: string, colorName: string | null) => void;
  updateQuantity: (productId: string, size: string, colorName: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, size: string, color: ProductColor | null, quantity = 1) => {
    setItems((prev) => {
      const colorName = color?.name || null;
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size && (item.color?.name || null) === colorName
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size && (item.color?.name || null) === colorName
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, size, color }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string, colorName: string | null) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size && (item.color?.name || null) === colorName)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, colorName: string | null, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, colorName);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size && (item.color?.name || null) === colorName
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
