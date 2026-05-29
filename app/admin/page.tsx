'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MenuManagement } from '@/components/admin/MenuManagement'
import { StockPanel } from '@/components/admin/StockPanel'
import { SalesReport } from '@/components/admin/SalesReport'
import {
  fetchProducts,
  fetchReport,
  updateProduct,
  updateStock,
  isGasConfigured,
} from '@/services/api'
import type { Product, DailyReport, ApiStatus } from '@/types'
import { ArrowLeft } from 'lucide-react'
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [productStatus, setProductStatus] = useState<ApiStatus>('idle')
  const [reportStatus, setReportStatus] = useState<ApiStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')

  const gasOk = isGasConfigured()

  useEffect(() => {
    async function load() {
      setProductStatus('loading')
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch {
        setProducts(MOCK_PRODUCTS)
      } finally {
        setProductStatus('success')
      }
    }
    if (gasOk) {
      load()
    } else {
      setProducts(MOCK_PRODUCTS)
      setProductStatus('success')
    }
  }, [gasOk])

  async function handleTabChange(tab: string) {
    setActiveTab(tab)
    if (tab === 'report' && !report && reportStatus !== 'loading') {
      setReportStatus('loading')
      try {
        const today = new Date().toISOString().slice(0, 10)
        const data = await fetchReport(today)
        setReport(data)
        setReportStatus('success')
      } catch {
        setReportStatus('error')
      }
    }
  }

  async function handleSaveProduct(product: Product) {
    setSaving(true)
    try {
      if (gasOk) await updateProduct(product)
      setProducts(prev => {
        const idx = prev.findIndex(p => p.id === product.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = product
          return next
        }
        return [...prev, product]
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleAdjustStock(id: string, delta: number) {
    setSaving(true)
    try {
      if (gasOk) await updateStock(id, delta)
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      ))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-secondary"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-semibold text-foreground">จัดการร้าน</h1>
        {!gasOk && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            โหมดตัวอย่าง
          </span>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex gap-1 w-full bg-secondary p-1 rounded-xl mb-4">
            <TabsTrigger
              value="menu"
              className="flex-1 rounded-lg py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              เมนู
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="flex-1 rounded-lg py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              สต็อก
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex-1 rounded-lg py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              รายได้วันนี้
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuManagement
              products={products}
              onSave={handleSaveProduct}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="stock">
            <StockPanel
              products={products}
              onAdjust={handleAdjustStock}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="report">
            <SalesReport
              report={report}
              loading={reportStatus === 'loading'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
