import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS } from "@/config/products";
import type { CartItem, Product } from "@/types/products";

/**
 * EL PRECIO QUE SE MUESTRA.
 *
 * El carrito se guarda en el navegador y sobrevive días, así que el precio
 * que quedó grabado puede ser viejo. Como al pagar el servidor SIEMPRE cobra
 * el del catálogo (ver `app/api/checkout/route.ts`), aquí se muestra ese mismo
 * — si no, alguien con un carrito de la semana pasada vería $600 en pantalla y
 * Stripe le cobraría otra cosa.
 *
 * Si la playera ya no está en el catálogo (se retiró entre drops), se cae al
 * precio guardado para no romper la vista; el checkout la rechazará de todos
 * modos y ahí se entera.
 */
export const precioVigente = (item: CartItem): number =>
  PRODUCTS.find((p) => p.slug === item.slug)?.price ?? item.price;

type CartState = {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Product, size: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;

  // selectores derivados
  totalItems: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, quantity) => {
        const id = `${product.slug}-${size}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          const item: CartItem = {
            id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            size,
            quantity,
          };
          return { items: [...state.items, item] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + precioVigente(i) * i.quantity,
          0
        ),
    }),
    {
      name: "indego-cart",
      // Solo persistimos los items, no el estado abierto/cerrado del drawer.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
