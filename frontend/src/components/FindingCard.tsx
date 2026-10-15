import { useState } from 'react'
import type { Finding } from '../types'
import { PriorityBadge, StatusBadge } from './ui'

export default function FindingCard({ finding, defaultOpen = false }: { finding: Finding; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `finding-${finding.record_id}`

  return (
    <article className="print-break rounded-lg border border-navy-700 bg-navy-850/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-white" title={finding.system_name}>
            {finding.system_name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-400">
            <span className="font-mono text-slate-200">{finding.algorithm}</span>
            {finding.key_size ? ` (${finding.key_size}-bit)` : ''} &middot; {finding.purpose}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={finding.quantum_status} />
          <PriorityBadge priority={finding.priority} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        <span className="font-medium text-teal-300">Recommended action: </span>
        {finding.recommended_action}
      </p>

      <button
        type="button"
        className="no-print mt-3 text-xs font-medium text-sky-300 hover:text-sky-200"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Hide' : 'Show'} why this was classified this way
      </button>

      <div id={id} className={`${open ? 'block' : 'hidden'} mt-3 space-y-2 text-sm text-slate-300 print:block`}>
        <p className="text-slate-400">{finding.explanation}</p>
        <ul className="list-disc space-y-1 pl-5">
          {finding.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Algorithm family: {finding.algorithm_family} &middot; Risk score {finding.risk_score}/100
        </p>
      </div>
    </article>
  )
}
