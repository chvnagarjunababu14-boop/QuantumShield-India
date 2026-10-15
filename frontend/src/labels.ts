import type { MigrationStatus, Priority, QuantumStatus } from './types'

export const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low', 'informational']

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Informational',
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
  low: '#38bdf8',
  informational: '#64748b',
}

export const PRIORITY_BADGE: Record<Priority, string> = {
  critical: 'bg-red-500/15 text-red-300 ring-red-500/40',
  high: 'bg-orange-500/15 text-orange-300 ring-orange-500/40',
  medium: 'bg-yellow-500/15 text-yellow-200 ring-yellow-500/40',
  low: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  informational: 'bg-slate-500/15 text-slate-300 ring-slate-500/40',
}

export const STATUS_SHORT: Record<QuantumStatus, string> = {
  vulnerable: 'Quantum-vulnerable',
  classically_weak: 'Classically weak',
  unknown: 'Needs review',
  reduced_margin: 'Reduced margin',
  low_concern: 'Low concern',
  quantum_resistant: 'Quantum-resistant design',
}

export const STATUS_COLOR: Record<QuantumStatus, string> = {
  vulnerable: '#f87171',
  classically_weak: '#fb923c',
  unknown: '#a78bfa',
  reduced_margin: '#facc15',
  low_concern: '#2dd4bf',
  quantum_resistant: '#34d399',
}

export const STATUS_BADGE: Record<QuantumStatus, string> = {
  vulnerable: 'bg-red-500/10 text-red-300 ring-red-500/30',
  classically_weak: 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  unknown: 'bg-violet-500/10 text-violet-300 ring-violet-500/30',
  reduced_margin: 'bg-yellow-500/10 text-yellow-200 ring-yellow-500/30',
  low_concern: 'bg-teal-500/10 text-teal-300 ring-teal-500/30',
  quantum_resistant: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
}

export const MIGRATION_LABEL: Record<MigrationStatus, string> = {
  not_started: 'Not started',
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  unknown: 'Unknown',
}

export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
