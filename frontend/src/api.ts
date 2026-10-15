import type { DashboardData, InventoryData, ReportData, RowError, UploadResult } from './types'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number
  errors: RowError[]

  constructor(message: string, status: number, errors: RowError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    throw new ApiError(
      `Cannot reach the QuantumShield API at ${API_BASE_URL}. Is the backend running?`,
      0,
    )
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = (body as { detail?: unknown } | null)?.detail
    if (detail && typeof detail === 'object' && 'message' in detail) {
      const d = detail as { message: string; errors?: RowError[] }
      throw new ApiError(d.message, response.status, d.errors ?? [])
    }
    throw new ApiError(
      typeof detail === 'string' ? detail : `Request failed with status ${response.status}.`,
      response.status,
    )
  }
  return body as T
}

export const api = {
  health: () => request<{ status: string; version: string }>('/api/health'),
  dashboard: () => request<DashboardData>('/api/dashboard'),
  inventory: () => request<InventoryData>('/api/inventory'),
  report: () => request<ReportData>('/api/report'),
  resetInventory: () => request<InventoryData>('/api/inventory/reset', { method: 'POST' }),
  uploadInventory: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<UploadResult>('/api/inventory/upload', { method: 'POST', body: form })
  },
  sampleCsvUrl: `${API_BASE_URL}/api/inventory/sample-csv`,
}
