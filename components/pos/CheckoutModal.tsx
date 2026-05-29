'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import type { CartItem, PaymentMethod } from '@/types'

interface Props {
  open: boolean
  items: CartItem[]
  total: number
  onClose: () => void
  onConfirm: (method: PaymentMethod, amountPaid: number) => void
  saving: boolean
}

export function CheckoutModal({ open, items, total, onClose, onConfirm, saving }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amountStr, setAmountStr] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('cash')
      setAmountStr('')
    }
  }, [open])

  const amountPaid = parseFloat(amountStr) || 0
  const isExact = method === 'cash' && amountStr === ''
  const effectivePaid = isExact ? total : amountPaid
  const change = isExact ? 0 : Math.max(0, amountPaid - total)
  const canConfirm = method === 'transfer' || isExact || amountPaid >= total

  const roundAmounts = [
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v > total).slice(0, 3)

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !saving) onClose() }}>
      <DialogContent className="max-w-sm rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">ชำระเงิน</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Order summary */}
          <div className="bg-secondary rounded-2xl p-3 space-y-1 max-h-36 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.product.name}
                  <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                </span>
                <span className="font-medium">฿{(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">ยอดรวม</span>
            <span className="text-2xl font-bold text-foreground">฿{total.toLocaleString()}</span>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'transfer'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-3 rounded-2xl font-medium text-sm transition-colors ${
                  method === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {m === 'cash' ? '💵 เงินสด' : '📱 โอนเงิน'}
              </button>
            ))}
          </div>

          {/* Cash input */}
          {method === 'cash' && (
            <div className="space-y-3">
              {/* Quick amount buttons */}
              <div className={`grid gap-2 ${roundAmounts.length > 0 ? 'grid-cols-4' : 'grid-cols-1'}`}>
                <button
                  onClick={() => setAmountStr('')}
                  className={`py-3 text-sm font-semibold rounded-xl transition-colors ${
                    isExact
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-accent'
                  }`}
                >
                  พอดี
                </button>
                {roundAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmountStr(String(amt))}
                    className={`py-3 text-sm font-medium rounded-xl transition-colors ${
                      amountStr === String(amt)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-accent'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <Input
                type="number"
                inputMode="numeric"
                placeholder="หรือกรอกจำนวนเงิน"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="h-12 text-lg font-semibold text-center rounded-2xl border-border"
              />

              {/* Change display */}
              {!isExact && amountPaid > 0 && (
                <div className="flex justify-between items-center bg-secondary rounded-2xl px-4 py-3">
                  <span className="text-muted-foreground text-sm">เงินทอน</span>
                  <span className={`text-2xl font-bold ${
                    change >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                    ฿{change.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confirm button */}
          <Button
            onClick={() => onConfirm(method, method === 'transfer' ? total : effectivePaid)}
            disabled={!canConfirm || saving}
            className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90"
          >
            {saving
              ? <><Loader2 className="mr-2 animate-spin" size={18} /> กำลังบันทึก...</>
              : 'ยืนยันการชำระเงิน'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
