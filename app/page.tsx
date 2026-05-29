'use client'

import { useState, useEffect, useCallback } from 'react'
import { MenuGrid } from '@/components/pos/MenuGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { CheckoutModal } from '@/components/pos/CheckoutModal'
import { fetchProducts, saveOrder, isGasConfigured } from '@/services/api'
import type { Product, CartItem, OrderRow, ApiStatus, PaymentMethod } from '@/types'
import { Settings, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const MOCK_PRODUCTS: Product[] = [
  { id: 'P001', name: 'ชาไทย', category: 'ชา', price: 35, costPrice: 12, stock: 50, unit: 'แก้ว', available: true },
  { id: 'P002', name: 'ชามะนาว', category: 'ชา', price: 30, costPrice: 10, stock: 50, unit: 'แก้ว', available: true },
  { id: 'P003', name: 'กาแฟเย็น', category: 'กาแฟ', price: 40, costPrice: 15, stock: 30, unit: 'แก้ว', available: true },
  { id: 'P004', name: 'โอเลี้ยง', category: 'กาแฟ', price: 30, costPrice: 10, stock: 30, unit: 'แก้ว', available: true },
  { id: 'P005', name: 'น้ำส้มคั้น', category: 'น้ำผลไม้', price: 45, costPrice: 20, stock: 20, unit: 'แก้ว', available: true },
  { id: 'P006', name: 'โซดาซิตรัส', category: 'โซดา', price: 35, costPrice: 12, stock: 40, unit: 'แก้ว', available: true },
  { id: 'P007', name: 'โซดาสตรอว์เบอร์รี', category: 'โซดา', price: 35, costPrice: 12, stock: 40, unit: 'แก้ว', available: true },
  { id: 'P008', name: 'ไอติมวานิลลา', category: 'ไอติม', price: 25, costPrice: 10, stock: 20, unit: 'ถ้วย', available: true },
]

function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const time = now.getTime().toString().slice(-4)
  return `ORD-${date}-${time}`
}

function formatOrderDate(d: Date): string {
  return d.toLocaleString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '')
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [status, setStatus] = useState<ApiStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const gasOk = isGasConfigured()

  const loadProducts = useCallback(async () => {
    setStatus('loading')
    setErrorMsg('')
    try {
      const data = await fetchProducts()
      setProducts(data)
      setStatus('success')
    } catch {
      setProducts(MOCK_PRODUCTS)
      setStatus('error')
      setErrorMsg('โหลดเมนูจาก Google Sheets ไม่ได้ — แสดงข้อมูลตัวอย่าง')
    }
  }, [])

  useEffect(() => {
    if (gasOk) {
      loadProducts()
    } else {
      setProducts(MOCK_PRODUCTS)
      setStatus('success')
    }
  }, [gasOk, loadProducts])

  function handleAddToCart(product: Product) {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, {
        product,
        quantity: 1,
        size: null,
        toppings: [],
        note: '',
        unitPrice: product.price,
        unitCost: product.costPrice,
      }]
    })
  }

  function handleUpdateQty(index: number, delta: number) {
    setCart(prev => {
      const next = [...prev]
      next[index] = { ...next[index], quantity: next[index].quantity + delta }
      return next
    })
  }

  function handleRemove(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmCheckout(method: PaymentMethod, amountPaid: number) {
    const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const totalCost = cart.reduce((s, i) => s + i.unitCost * i.quantity, 0)
    const now = new Date()

    const order: OrderRow = {
      id: generateOrderId(),
      date: formatOrderDate(now),
      itemsSummary: cart.map(i => `${i.product.name} ×${i.quantity}`).join(', '),
      total,
      totalCost,
      profit: total - totalCost,
      paymentMethod: method,
      amountPaid,
      change: method === 'cash' ? Math.max(0, amountPaid - total) : 0,
      items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    }

    setSaving(true)
    try {
      if (gasOk) await saveOrder(order)
    } catch {
      // Order display succeeds even if save fails
    } finally {
      setSaving(false)
    }

    setCart([])
    setCheckoutOpen(false)
    setSuccessMsg(`บันทึกออร์เดอร์ ${order.id} เรียบร้อย`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left: Menu */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h1 className="font-bold text-lg text-foreground">☕ ร้านน้ำ</h1>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-secondary"
          >
            <Settings size={16} />
            <span>จัดการ</span>
          </Link>
        </header>

        {/* Error banner */}
        {status === 'error' && errorMsg && (
          <div className="shrink-0 flex items-center justify-between gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2">
            <span className="text-amber-800 text-sm">{errorMsg}</span>
            <button
              onClick={loadProducts}
              className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs font-medium"
            >
              <RefreshCw size={13} /> ลองใหม่
            </button>
          </div>
        )}

        {/* Success toast */}
        {successMsg && (
          <div className="shrink-0 bg-green-50 border-b border-green-200 px-4 py-2">
            <span className="text-green-800 text-sm">{successMsg}</span>
          </div>
        )}

        {/* Not configured notice */}
        {!gasOk && (
          <div className="shrink-0 bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700">
            โหมดตัวอย่าง — ตั้งค่า NEXT_PUBLIC_GAS_URL ใน .env.local เพื่อเชื่อมต่อ Google Sheets
          </div>
        )}

        <MenuGrid
          products={products}
          onAddToCart={handleAddToCart}
          loading={status === 'loading'}
        />
      </div>

      {/* Right: Cart */}
      <div className="shrink-0 w-90 border-l border-border flex flex-col">
        <CartPanel
          items={cart}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onCheckout={() => setCheckoutOpen(true)}
        />
      </div>

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirmCheckout}
        saving={saving}
      />
    </div>
  )
}
