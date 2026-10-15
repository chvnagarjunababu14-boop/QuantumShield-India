import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { api } from '../api'
import FindingCard from '../components/FindingCard'
import { EmptyState, ErrorState, LoadingState, PageHeader, SourceBanner, StatCard } from '../components/ui'
import { useApi } from '../hooks'
import { MIGRATION_LABEL, PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL, STATUS_COLOR, STATUS_SHORT } from '../labels'
import type { MigrationStatus, QuantumStatus } from '../types'

const tooltipStyle = {
  contentStyle: { background: '#0a1428', border: '1px solid #284069', borderRadius: 8, color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
}

function readinessColor(pct: number) {
  if (pct >= 80) return 'text-emerald-300'
  if (pct >= 50) return 'text-teal-300'
  if (pct >= 25) return 'text-yellow-300'
  return 'text-orange-300'
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useApi(api.dashboard)

  if (loading && !data) return <LoadingState label="Loading dashboard..." />
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  if (!data) return null

  const s = data.summary
  if (s.total_dependencies === 0) {
    return (
      <EmptyState title="No inventory loaded">
        <Link className="text-teal-300 underline" to="/inventory">Upload a CSV</Link> to see your dashboard.
      </EmptyState>
    )
  }

  const statusData = (Object.keys(s.quantum_status_counts) as QuantumStatus[])
    .map((k) => ({ key: k, name: STATUS_SHORT[k], value: s.quantum_status_counts[k] }))
    .filter((d) => d.value > 0)
  const priorityData = PRIORITIES.map((p) => ({ key: p, name: PRIORITY_LABEL[p], value: s.priority_counts[p] }))
  const familyData = Object.entries(s.algorithm_family_counts).map(([name, value]) => ({ name, value }))
  const migrationData = (Object.keys(s.migration_status_counts) as MigrationStatus[]).map((k) => ({
    name: MIGRATION_LABEL[k],
    value: s.migration_status_counts[k],
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quantum Readiness Dashboard"
        subtitle="An overview of cryptographic dependencies from the current inventory, assessed with transparent rules."
        actions={
          <>
            <Link to="/inventory" className="btn btn-secondary">Manage inventory</Link>
            <Link to="/report" className="btn btn-primary">View report</Link>
          </>
        }
      />

      <SourceBanner source={data.source} label={data.source_label} />

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventoried systems" value={s.total_systems} hint={`${s.total_dependencies} cryptographic dependencies`} />
        <StatCard
          label="Require quantum-risk review"
          value={s.requiring_review}
          hint={`${s.quantum_vulnerable} use quantum-vulnerable public-key algorithms`}
          accent="text-sky-300"
        />
        <StatCard label="High-priority findings" value={s.high_priority} hint="Critical + high system priority" accent="text-orange-300" />
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Migration readiness</p>
          <p className={`mt-2 text-3xl font-semibold ${readinessColor(s.readiness.percent)}`}>
            {s.readiness.percent}% <span className="text-base font-medium">{s.readiness.label}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-700" role="progressbar" aria-valuenow={s.readiness.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Migration readiness">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400" style={{ width: `${s.readiness.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500" title={s.readiness.definition}>
            Indicative only &middot; {s.readiness.migration_in_progress_count} migrations planned or in progress
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-medium text-white">Algorithm-level quantum status</h2>
          <p className="text-xs text-slate-500">How each algorithm fares against known quantum attacks, independent of context.</p>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2} stroke="none">
                  {statusData.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLOR[d.key]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-medium text-white">System-level review priority</h2>
          <p className="text-xs text-slate-500">Combines algorithm status with sensitivity, confidentiality period, criticality and migration status.</p>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#12213f' }} />
                <Bar dataKey="value" name="Findings" radius={[4, 4, 0, 0]}>
                  {priorityData.map((d) => (
                    <Cell key={d.key} fill={PRIORITY_COLOR[d.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-medium text-white">Inventory by algorithm family</h2>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={familyData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#12213f' }} />
                <Bar dataKey="value" name="Dependencies" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-medium text-white">Migration status</h2>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={migrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#12213f' }} />
                <Bar dataKey="value" name="Dependencies" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Top findings and recommended actions</h2>
            <p className="text-xs text-slate-500">Highest-priority dependencies requiring review.</p>
          </div>
          <Link to="/inventory" className="text-sm text-teal-300 hover:text-teal-200">All findings &rarr;</Link>
        </div>
        {data.top_findings.length === 0 ? (
          <p className="text-sm text-slate-400">No dependencies currently require quantum-risk review.</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {data.top_findings.map((f) => (
              <FindingCard key={f.record_id} finding={f} />
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500">{data.disclaimer}</p>
    </div>
  )
}
