'use client'

import { Loader2 } from 'lucide-react'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  onAdjust: (id: string, delta: number) => Promise<void>
  saving: boolean
}

export function StockPanel({ products, onAdjust, saving }: Props) {
  return (
    <div className="space-y-2">
      {products.map(p => {
        const unlimited = p.stock < 0
        const lowStock = !unlimited && p.stock <= 5

        return (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              lowStock ? 'bg-amber-50 border-amber-200' : 'bg-card border-border'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xl font-bold w-14 text-center ${
                lowStock ? 'text-amber-700' : 'text-foreground'
              }`}>
                {unlimited ? '∞' : p.stock}
              </span>
              <span className="text-xs text-muted-foreground">{p.unit}</span>

              {!unlimited && (
                <div className="flex items-center gap-1">
                  {([-5, -1, 1, 5] as const).map(delta => (
                    <button
                      key={delta}
                      onClick={() => onAdjust(p.id, delta)}
                      disabled={saving || (delta < 0 && p.stock === 0)}
                      className={`w-10 h-9 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
                        delta > 0
                          ? 'bg-secondary hover:bg-primary hover:text-primary-foreground'
                          : 'bg-secondary hover:bg-amber-100 hover:text-amber-800'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              )}

              {saving && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
            </div>
          </div>
        )
      })}

      {products.length === 0 && (
        <div className="text-center text-muted-foreground py-12 text-sm">
          ยังไม่มีสินค้า
        </div>
      )}
    </div>
  )
}
