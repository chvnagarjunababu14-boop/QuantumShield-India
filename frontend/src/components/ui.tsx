import type { ReactNode } from 'react'
import { PRIORITY_BADGE, PRIORITY_LABEL, STATUS_BADGE, STATUS_SHORT } from '../labels'
import type { Priority, QuantumStatus } from '../types'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PRIORITY_BADGE[priority]}`}>
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

export function StatusBadge({ status }: { status: QuantumStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[status]}`}>
      {STATUS_SHORT[status]}
    </span>
  )
}

export function StatCard({ label, value, hint, accent = 'text-white' }: { label: string; value: ReactNode; hint?: string; accent?: string }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-16 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      {label}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card border-red-500/40 bg-red-950/30">
      <p className="font-medium text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-red-200/80">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <p className="font-medium text-slate-200">{title}</p>
      {children && <div className="mt-2 max-w-md text-sm text-slate-400">{children}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'success'; children: ReactNode }) {
  const tones = {
    info: 'border-sky-500/30 bg-sky-950/30 text-sky-200',
    warn: 'border-amber-500/30 bg-amber-950/30 text-amber-200',
    success: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200',
  }
  return <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}

export function SourceBanner({ source, label }: { source: 'sample' | 'upload'; label: string }) {
  return source === 'sample' ? (
    <Notice tone="warn">
      <strong>Sample data:</strong> {label}. All systems are fictional. Upload your own CSV on the Cryptographic Inventory page.
    </Notice>
  ) : (
    <Notice tone="info">
      <strong>Source:</strong> {label}. Results reflect only what is in the uploaded CSV, not a full infrastructure scan.
    </Notice>
  )
}
