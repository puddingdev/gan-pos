'use client'

import type { DailyReport } from '@/types'

interface Props {
  report: DailyReport | null
  loading: boolean
}

function SummaryCard({ label, value, sub, color }: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return <div className="rounded-2xl h-24 bg-muted animate-pulse" />
}

export function SalesReport({ report, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!report || report.orderCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <span className="text-4xl">📊</span>
        <p className="text-sm">ยังไม่มีออร์เดอร์วันนี้</p>
      </div>
    )
  }

  const profitPositive = report.netProfit >= 0

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="รายรับวันนี้"
          value={`฿${report.totalRevenue.toLocaleString()}`}
          sub={`${report.orderCount} ออร์เดอร์`}
          color="bg-primary text-primary-foreground"
        />
        <SummaryCard
          label="ต้นทุนรวม"
          value={`฿${report.totalCost.toLocaleString()}`}
          color="bg-secondary text-foreground"
        />
        <SummaryCard
          label="กำไรสุทธิ"
          value={`฿${report.netProfit.toLocaleString()}`}
          sub={`${((report.netProfit / report.totalRevenue) * 100).toFixed(1)}%`}
          color={profitPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        />
      </div>

      {/* Order list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">รายการออร์เดอร์</h3>
        {report.orders.map(order => (
          <div key={order.id} className="bg-card border border-border rounded-2xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{order.date}</p>
                <p className="text-sm text-foreground mt-0.5 line-clamp-1">{order.itemsSummary}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm text-foreground">฿{order.total.toLocaleString()}</p>
                <p className="text-xs text-green-600">กำไร ฿{order.profit.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {order.paymentMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
