import type { Product, OrderRow, DailyReport } from '@/types'

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? ''

async function fetchWithTimeout(url: string, opts?: RequestInit, ms = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...opts, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function gasGet<T>(action: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(GAS_URL)
  url.searchParams.set('action', action)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetchWithTimeout(url.toString())
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'GAS error')
  return json.data as T
}

async function gasPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'GAS error')
  return json.data as T
}

export function isGasConfigured(): boolean {
  return Boolean(GAS_URL)
}

export async function fetchProducts(): Promise<Product[]> {
  return gasGet<Product[]>('getProducts')
}

export async function fetchReport(date?: string): Promise<DailyReport> {
  return gasGet<DailyReport>('getReport', date ? { date } : undefined)
}

export async function saveOrder(order: OrderRow): Promise<void> {
  await gasPost({ action: 'saveOrder', payload: order })
}

export async function updateProduct(product: Product): Promise<void> {
  await gasPost({ action: 'updateProduct', payload: product })
}

export async function updateStock(id: string, delta: number): Promise<void> {
  await gasPost({ action: 'updateStock', id, delta })
}
