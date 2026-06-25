import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type { Invoice } from '@/types/billing.types'

export interface ListInvoicesParams {
  subscriptionId?: string
  status?: string
  limit?: number
  cursor?: string
}

export const invoiceService = {
  /** GET /invoices — list invoices for authenticated tenant/user */
  async list(params: ListInvoicesParams = {}): Promise<{
    items: Invoice[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<Invoice[]>>('/invoices', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /invoices/:id — invoice detail */
  async getById(id: string): Promise<Invoice> {
    const res = await apiClient.get<ApiSuccess<Invoice>>(
      `/invoices/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /**
   * GET /invoices/:id/pdf — 302 to signed S3 URL.
   * NOTE: Invoice PDF uses Puppeteer — same limitation as certificates (may return HTML).
   */
  async downloadPdf(id: string): Promise<void> {
    const response = await apiClient.get(
      `/invoices/${encodeURIComponent(id)}/pdf`,
      { responseType: 'blob' }
    )
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
