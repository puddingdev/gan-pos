'use client'

import type { Product } from '@/types'

interface Props {
  products: Product[]
  onAdjust: (id: string, delta: number) => Promise<void>
  saving: boolean
}

export function StockPanel({ products, onAdjust, saving }: Props) {
  function handleCommit(p: Product, value: string) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0 || num === p.stock) return
    onAdjust(p.id, num - p.stock)
  }

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
              {unlimited ? (
                <span className="text-xl font-bold w-14 text-center text-foreground">∞</span>
              ) : (
                <input
                  key={p.stock}
                  type="number"
                  inputMode="numeric"
                  defaultValue={p.stock}
                  min={0}
                  disabled={saving}
                  onBlur={e => handleCommit(p, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  className={`w-16 text-xl font-bold text-center rounded-xl border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary px-1 py-0.5 disabled:opacity-40 ${
                    lowStock ? 'text-amber-700' : 'text-foreground'
                  }`}
                />
              )}
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
