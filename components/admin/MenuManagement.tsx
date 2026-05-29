'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  onSave: (product: Product) => Promise<void>
  saving: boolean
}

const CATEGORIES = ['ชา', 'กาแฟ', 'โซดา', 'น้ำผลไม้', 'ไอติม', 'อื่นๆ']

const EMPTY: Omit<Product, 'id'> = {
  name: '', category: 'ชา', price: 0, costPrice: 0,
  stock: 10, unit: 'แก้ว', available: true,
}

export function MenuManagement({ products, onSave, saving }: Props) {
  const [open, setOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY)

  function openAdd() {
    setEditProduct(null)
    setForm(EMPTY)
    setOpen(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setForm({ name: p.name, category: p.category, price: p.price, costPrice: p.costPrice, stock: p.stock, unit: p.unit, available: p.available })
    setOpen(true)
  }

  async function handleSave() {
    const id = editProduct?.id ?? `P${Date.now()}`
    await onSave({ id, ...form })
    setOpen(false)
  }

  async function toggleAvailable(p: Product) {
    await onSave({ ...p, available: !p.available })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} รายการ</p>
        <Button onClick={openAdd} size="sm" className="rounded-xl gap-1.5 bg-primary text-primary-foreground">
          <Plus size={15} /> เพิ่มเมนู
        </Button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
              p.available ? 'bg-card border-border' : 'bg-muted border-border opacity-60'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {p.category} · ฿{p.price} (ต้นทุน ฿{p.costPrice}) · stock {p.stock} {p.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Available toggle */}
              <button
                onClick={() => toggleAvailable(p)}
                disabled={saving}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  p.available ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  p.available ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                }`} />
              </button>
              <button
                onClick={() => openEdit(p)}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <Pencil size={15} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={v => { if (!v && !saving) setOpen(false) }}>
        <DialogContent className="max-w-sm rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>{editProduct ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ชื่อสินค้า</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="เช่น ชาไทย"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">หมวดหมู่</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                      form.category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-accent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ราคาขาย (฿)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ต้นทุน (฿)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.costPrice || ''}
                  onChange={e => setForm(f => ({ ...f, costPrice: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">stock เริ่มต้น</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">หน่วย</label>
                <Input
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="แก้ว / ถ้วย"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!form.name || saving}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'บันทึก'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
