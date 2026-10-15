import { useState } from 'react'
import { api } from '../api'
import FindingCard from '../components/FindingCard'
import { ErrorState, LoadingState, PageHeader, SourceBanner } from '../components/ui'
import { useApi } from '../hooks'
import { MIGRATION_LABEL, PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL, STATUS_SHORT } from '../labels'
import type { MigrationStatus, QuantumStatus } from '../types'

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default function ReportPage() {
  const { data, error, loading, reload } = useApi(api.report)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  if (loading && !data) return <LoadingState label="Generating report..." />
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  if (!data) return null

  const s = data.summary

  return (
    <div className="print-area space-y-6">
      <PageHeader
        title={data.title}
        subtitle={`Generated ${fmt(data.generated_at)} \u00b7 ${data.source_label}`}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={reload}>Refresh</button>
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
          </>
        }
      />

      <div className="no-print">
        <SourceBanner source={data.source} label={data.source_label} />
      </div>

      <section className="card print-break">
        <h2 className="mb-3 text-lg font-semibold text-white">1. Inventory summary</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Systems', s.total_systems],
            ['Dependencies', s.total_dependencies],
            ['Requiring review', s.requiring_review],
            ['Quantum-vulnerable', s.quantum_vulnerable],
            ['High priority', s.high_priority],
            ['Readiness (indicative)', `${s.readiness.percent}% \u00b7 ${s.readiness.label}`],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="mt-1 text-xl font-semibold text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">By system priority</h3>
            <ul className="space-y-1 text-sm">
              {PRIORITIES.map((p) => (
                <li key={p} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                    {PRIORITY_LABEL[p]}
                  </span>
                  <span className="font-mono">{s.priority_counts[p]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">By algorithm-level status</h3>
            <ul className="space-y-1 text-sm">
              {(Object.keys(s.quantum_status_counts) as QuantumStatus[]).map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{STATUS_SHORT[k]}</span>
                  <span className="font-mono">{s.quantum_status_counts[k]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">By migration status</h3>
            <ul className="space-y-1 text-sm">
              {(Object.keys(s.migration_status_counts) as MigrationStatus[]).map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{MIGRATION_LABEL[k]}</span>
                  <span className="font-mono">{s.migration_status_counts[k]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">{s.readiness.definition}</p>
      </section>

      <section className="card print-break">
        <h2 className="mb-3 text-lg font-semibold text-white">2. Recommended next actions</h2>
        {data.next_actions.length === 0 ? (
          <p className="text-sm text-slate-400">No dependencies currently require quantum-risk review.</p>
        ) : (
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            {data.next_actions.map((a) => (
              <li key={a.action}>
                {a.action}. <span className="text-slate-500">({a.count} finding{a.count === 1 ? '' : 's'})</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card">
        <h2 className="mb-1 text-lg font-semibold text-white">3. Findings by priority</h2>
        <p className="mb-4 text-xs text-slate-500">Each finding lists the algorithm-level classification, the system-level priority, the reasons, and a recommended action.</p>
        <div className="space-y-6">
          {PRIORITIES.map((p) => {
            const list = data.findings_by_priority[p]
            if (!list.length) return null
            return (
              <div key={p}>
                <h3 className="mb-2 flex items-center gap-2 font-medium text-white">
                  <span className="h-3 w-3 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                  {PRIORITY_LABEL[p]} ({list.length})
                </h3>
                <div className="grid gap-3 xl:grid-cols-2 print:grid-cols-1">
                  {list.map((f) => (
                    <FindingCard key={f.record_id} finding={f} defaultOpen={p === 'critical' || p === 'high'} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card print-break">
        <h2 className="mb-3 text-lg font-semibold text-white">4. Migration planning checklist</h2>
        <ul className="space-y-2">
          {data.migration_checklist.map((c, i) => (
            <li key={i}>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-teal-500"
                  checked={!!checked[i]}
                  onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
                />
                <span>
                  <span className="mr-2 rounded bg-navy-800 px-1.5 py-0.5 text-xs font-medium text-teal-300">{c.phase}</span>
                  {c.item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-navy-700 p-4 text-xs text-slate-400 print-break">
        <p className="font-medium text-slate-300">Disclaimer</p>
        <p className="mt-1">{data.disclaimer}</p>
      </section>
    </div>
  )
}
