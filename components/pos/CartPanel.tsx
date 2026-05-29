'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import type { CartItem } from '@/types'

interface Props {
  items: CartItem[]
  onUpdateQty: (index: number, delta: number) => void
  onRemove: (index: number) => void
  onCheckout: () => void
}

export function CartPanel({ items, onUpdateQty, onRemove, onCheckout }: Props) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="font-semibold text-foreground">รายการคิดเงิน</h2>
        {itemCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {itemCount}
          </span>
        )}
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <ShoppingBag size={40} strokeWidth={1.5} />
            <span className="text-sm">ยังไม่มีรายการ</span>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, idx) => (
              <li key={idx} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground leading-tight truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ฿{item.unitPrice} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    ฿{(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => item.quantity <= 1 ? onRemove(idx) : onUpdateQty(idx, -1)}
                    className="h-9 w-9 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    {item.quantity <= 1
                      ? <Trash2 size={15} className="text-destructive" />
                      : <Minus size={15} className="text-foreground" />
                    }
                  </button>
                  <span className="w-8 text-center font-semibold text-foreground text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(idx, 1)}
                    className="h-9 w-9 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    <Plus size={15} className="text-foreground" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-4 pt-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">รวมทั้งหมด</span>
          <span className="text-2xl font-bold text-foreground">
            ฿{total.toLocaleString()}
          </span>
        </div>
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          ชำระเงิน
        </Button>
      </div>
    </div>
  )
}
