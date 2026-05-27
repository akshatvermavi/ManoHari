import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  productTitle: string
  productImage?: string
  color?: string
  size?: string
  quantity: number
  price: number
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  setCart: (items: CartItem[], totalAmount: number) => void
  clearLocalCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalAmount: 0,
      totalItems: 0,
      setCart: (items, totalAmount) =>
        set({ items, totalAmount, totalItems: items.length }),
      clearLocalCart: () => set({ items: [], totalAmount: 0, totalItems: 0 }),
    }),
    { name: 'manohari-cart' }
  )
)
