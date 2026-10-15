import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { api, ApiError } from '../api'
import FindingCard from '../components/FindingCard'
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader, PriorityBadge, SourceBanner, StatusBadge } from '../components/ui'
import { useApi } from '../hooks'
import { MIGRATION_LABEL, PRIORITIES, PRIORITY_LABEL, STATUS_SHORT, titleCase } from '../labels'
import type { InventoryData, Priority, QuantumStatus, RowError, UploadResult } from '../types'

const MAX_BYTES = 1_000_000

type UploadState =
  | { kind: 'idle' }
  | { kind: 'uploading'; name: string }
  | { kind: 'success'; result: UploadResult }
  | { kind: 'error'; message: string; errors: RowError[] }

function ErrorTable({ errors }: { errors: RowError[] }) {
  if (errors.length === 0) return null
  return (
    <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-navy-700">
      <table className="w-full">
        <thead className="sticky top-0 bg-navy-850">
          <tr>
            <th className="table-th">Line</th>
            <th className="table-th">Column</th>
            <th className="table-th">Problem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700">
          {errors.map((e, i) => (
            <tr key={i}>
              <td className="table-td font-mono text-slate-400">{e.row ?? '-'}</td>
              <td className="table-td font-mono text-slate-300">{e.field ?? '-'}</td>
              <td className="table-td text-red-200">{e.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function InventoryPage() {
  const { data: loaded, error, loading, reload } = useApi(api.inventory)
  const [override, setOverride] = useState<InventoryData | null>(null)
  const [upload, setUpload] = useState<UploadState>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)
  const [tab, setTab] = useState<'findings' | 'records'>('findings')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<QuantumStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const data = override ?? loaded

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUpload({ kind: 'error', message: `"${file.name}" is not a .csv file. Please upload a CSV.`, errors: [] })
      return
    }
    if (file.size > MAX_BYTES) {
      setUpload({ kind: 'error', message: 'File is larger than the 1 MB limit.', errors: [] })
      return
    }
    setUpload({ kind: 'uploading', name: file.name })
    try {
      const result = await api.uploadInventory(file)
      setOverride(result)
      setUpload({ kind: 'success', result })
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError(String(err), 0)
      setUpload({ kind: 'error', message: e.message, errors: e.errors })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function resetToSample() {
    setUpload({ kind: 'uploading', name: 'sample data' })
    try {
      setOverride(await api.resetInventory())
      setUpload({ kind: 'idle' })
    } catch (err) {
      setUpload({ kind: 'error', message: err instanceof Error ? err.message : String(err), errors: [] })
    }
  }

  const findingById = useMemo(() => new Map(data?.findings.map((f) => [f.record_id, f]) ?? []), [data])

  const filteredFindings = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data?.findings ?? []).filter(
      (f) =>
        (priorityFilter === 'all' || f.priority === priorityFilter) &&
        (statusFilter === 'all' || f.quantum_status === statusFilter) &&
        (!q || `${f.system_name} ${f.algorithm} ${f.purpose}`.toLowerCase().includes(q)),
    )
  }, [data, priorityFilter, statusFilter, query])

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    void handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cryptographic Inventory Analyzer"
        subtitle="Upload a CSV describing where your organisation uses cryptography. Each row is classified by the rule-based quantum risk engine. This assesses only what you upload; it is not a scan of your infrastructure."
        actions={
          <>
            <a className="btn btn-secondary" href={api.sampleCsvUrl} download>
              Download sample CSV
            </a>
            <button type="button" className="btn btn-secondary" onClick={resetToSample} disabled={upload.kind === 'uploading'}>
              Restore sample data
            </button>
          </>
        }
      />

      <section className="card space-y-4" aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="font-medium text-white">Upload inventory CSV</h2>
        <label
          htmlFor="csv-input"
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? 'border-teal-400 bg-teal-500/5' : 'border-navy-600 hover:border-sky-500/60 hover:bg-navy-850'
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-3 text-sm text-slate-200">
            <span className="font-medium text-teal-300">Choose a CSV file</span> or drag it here
          </span>
          <span className="mt-1 text-xs text-slate-500">.csv only &middot; max 1 MB &middot; max 2,000 rows</span>
          <input
            id="csv-input"
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e: ChangeEvent<HTMLInputElement>) => void handleFile(e.target.files?.[0])}
          />
        </label>

        <details className="text-sm text-slate-400">
          <summary className="cursor-pointer text-slate-300">Required columns and accepted values</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><code className="text-sky-300">system_name</code> - system or application name</li>
            <li><code className="text-sky-300">algorithm</code> - e.g. RSA-2048, ECDSA-P256, AES-256-GCM, SHA-256 (blank = needs review)</li>
            <li><code className="text-sky-300">purpose</code> - e.g. TLS key exchange, code signing, database encryption</li>
            <li><code className="text-sky-300">key_size</code> (optional) - bits, blank if not applicable</li>
            <li><code className="text-sky-300">data_sensitivity</code> - low, medium, high, critical (or public/internal/confidential/restricted)</li>
            <li><code className="text-sky-300">confidentiality_years</code> - how long data must stay confidential (0 if not applicable)</li>
            <li><code className="text-sky-300">business_criticality</code> - low, medium, high, critical</li>
            <li><code className="text-sky-300">migration_status</code> - not_started, planned, in_progress, completed, unknown</li>
          </ul>
          <p className="mt-2">Do not include passwords, private keys, credentials or real confidential data. Uploaded data is kept only in server memory.</p>
        </details>

        <div aria-live="polite">
          {upload.kind === 'uploading' && <LoadingState label={`Processing ${upload.name}...`} />}
          {upload.kind === 'success' && (
            <div className="space-y-2">
              <Notice tone="success">
                Imported <strong>{upload.result.imported_count}</strong> record(s)
                {upload.result.rejected_count > 0 && (
                  <> &middot; <strong>{upload.result.rejected_count}</strong> row(s) rejected - see details below</>
                )}
                .
              </Notice>
              {upload.result.warnings.map((w, i) => (
                <Notice key={i} tone="warn">{w}</Notice>
              ))}
              <ErrorTable errors={upload.result.errors} />
            </div>
          )}
          {upload.kind === 'error' && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-4">
              <p className="font-medium text-red-300">Upload failed</p>
              <p className="mt-1 text-sm text-red-200/90">{upload.message}</p>
              <ErrorTable errors={upload.errors} />
            </div>
          )}
        </div>
      </section>

      {loading && !data && <LoadingState label="Loading inventory..." />}
      {error && !data && <ErrorState message={error.message} onRetry={reload} />}

      {data && (
        <>
          <SourceBanner source={data.source} label={data.source_label} />

          <div role="tablist" aria-label="Inventory views" className="flex gap-2 border-b border-navy-700">
            {(['findings', 'records'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  tab === t ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'findings' ? `Findings (${data.findings.length})` : `Imported records (${data.records.length})`}
              </button>
            ))}
          </div>

          {data.records.length === 0 ? (
            <EmptyState title="No records yet">Upload a CSV or restore the sample data to get started.</EmptyState>
          ) : tab === 'findings' ? (
            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block text-slate-400">Search</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="System, algorithm or purpose"
                    className="w-full rounded-lg border border-navy-600 bg-navy-850 px-3 py-2 text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-slate-400">Priority</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    className="w-full rounded-lg border border-navy-600 bg-navy-850 px-3 py-2 text-slate-100"
                  >
                    <option value="all">All priorities</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-slate-400">Algorithm status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as QuantumStatus | 'all')}
                    className="w-full rounded-lg border border-navy-600 bg-navy-850 px-3 py-2 text-slate-100"
                  >
                    <option value="all">All statuses</option>
                    {(Object.keys(STATUS_SHORT) as QuantumStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_SHORT[s]}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Showing {filteredFindings.length} of {data.findings.length}. The coloured status badge is the{' '}
                <em>algorithm-level</em> quantum classification; the priority badge is the <em>system-level</em> review priority.
              </p>
              {filteredFindings.length === 0 ? (
                <EmptyState title="No findings match these filters" />
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {filteredFindings.map((f) => (
                    <FindingCard key={f.record_id} finding={f} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="card overflow-x-auto p-0">
              <table className="w-full min-w-[960px]">
                <caption className="sr-only">Imported cryptographic inventory records</caption>
                <thead className="bg-navy-850">
                  <tr>
                    <th className="table-th">System</th>
                    <th className="table-th">Algorithm</th>
                    <th className="table-th">Purpose</th>
                    <th className="table-th">Key size</th>
                    <th className="table-th">Sensitivity</th>
                    <th className="table-th">Confid. (yrs)</th>
                    <th className="table-th">Criticality</th>
                    <th className="table-th">Migration</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700">
                  {data.records.map((r) => {
                    const f = findingById.get(r.id)
                    return (
                      <tr key={r.id} className="hover:bg-navy-850/60">
                        <td className="table-td max-w-[220px] break-words text-slate-100">{r.system_name}</td>
                        <td className="table-td font-mono text-sky-200">{r.algorithm || <span className="text-slate-500">(blank)</span>}</td>
                        <td className="table-td text-slate-300">{r.purpose}</td>
                        <td className="table-td text-slate-300">{r.key_size ?? '-'}</td>
                        <td className="table-td">{titleCase(r.data_sensitivity)}</td>
                        <td className="table-td">{r.confidentiality_years}</td>
                        <td className="table-td">{titleCase(r.business_criticality)}</td>
                        <td className="table-td">{MIGRATION_LABEL[r.migration_status]}</td>
                        <td className="table-td">{f && <StatusBadge status={f.quantum_status} />}</td>
                        <td className="table-td">{f && <PriorityBadge priority={f.priority} />}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  )
}
