export interface Product {
  id: string
  name: string
  category: string
  price: number
  costPrice: number
  stock: number      // -1 = unlimited
  unit: string
  available: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  size: string | null
  toppings: string[]
  note: string
  unitPrice: number
  unitCost: number
}

export interface OrderRow {
  id: string
  date: string           // "2026-05-29 14:30"
  itemsSummary: string   // "ชาไทย x2, กาแฟเย็น x1"
  total: number
  totalCost: number
  profit: number
  paymentMethod: 'cash' | 'transfer'
  amountPaid: number
  change: number
  items: Array<{ productId: string; quantity: number }>
}

export interface DailyReport {
  date: string
  orderCount: number
  totalRevenue: number
  totalCost: number
  netProfit: number
  orders: Omit<OrderRow, 'items'>[]
}

export type ApiStatus = 'idle' | 'loading' | 'error' | 'success'
export type PaymentMethod = 'cash' | 'transfer'
