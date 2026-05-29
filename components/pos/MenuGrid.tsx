'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  onAddToCart: (product: Product) => void
  loading: boolean
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border animate-pulse h-[100px]" />
  )
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const outOfStock = product.stock === 0
  const unavailable = !product.available || outOfStock

  return (
    <button
      onClick={onAdd}
      disabled={unavailable}
      className={`
        flex flex-col items-start justify-between p-4 rounded-2xl border text-left
        min-h-[100px] w-full transition-all active:scale-95
        ${unavailable
          ? 'bg-muted border-border opacity-50 cursor-not-allowed'
          : 'bg-card border-border hover:border-primary hover:shadow-md cursor-pointer'
        }
      `}
    >
      <span className="font-medium text-foreground leading-tight line-clamp-2">
        {product.name}
      </span>
      <div className="flex items-end justify-between w-full mt-2 gap-1">
        <span className="text-primary font-semibold text-lg">
          ฿{product.price}
        </span>
        {product.stock >= 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            product.stock <= 5
              ? 'bg-amber-100 text-amber-700'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {outOfStock ? 'หมด' : `${product.stock} ${product.unit}`}
          </span>
        )}
      </div>
    </button>
  )
}

export function MenuGrid({ products, onAddToCart, loading }: Props) {
  const categories = ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category)))]
  const [active, setActive] = useState('ทั้งหมด')

  const filtered = active === 'ทั้งหมด'
    ? products
    : products.filter(p => p.category === active)

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <Tabs value={active} onValueChange={setActive} className="flex flex-col flex-1 min-h-0">
      <div className="px-4 pt-3 pb-0 shrink-0">
        <TabsList className="flex gap-1 h-auto flex-wrap bg-secondary p-1 rounded-xl">
          {categories.map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {categories.map(cat => (
        <TabsContent key={cat} value={cat} className="flex-1 overflow-y-auto p-4 mt-0">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              ไม่มีสินค้าในหมวดนี้
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => onAddToCart(product)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
