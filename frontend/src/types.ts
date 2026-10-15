export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'informational'
export type QuantumStatus =
  | 'vulnerable'
  | 'classically_weak'
  | 'unknown'
  | 'reduced_margin'
  | 'low_concern'
  | 'quantum_resistant'
export type MigrationStatus = 'not_started' | 'planned' | 'in_progress' | 'completed' | 'unknown'
export type Level = 'low' | 'medium' | 'high' | 'critical'

export interface InventoryRecord {
  id: string
  system_name: string
  algorithm: string
  purpose: string
  key_size: number | null
  data_sensitivity: Level
  confidentiality_years: number
  business_criticality: Level
  migration_status: MigrationStatus
}

export interface Finding {
  record_id: string
  system_name: string
  algorithm: string
  purpose: string
  purpose_category: string
  key_size: number | null
  algorithm_family: string
  quantum_status: QuantumStatus
  quantum_status_label: string
  requires_review: boolean
  priority: Priority
  risk_score: number
  explanation: string
  reasons: string[]
  recommended_action: string
}

export interface Summary {
  total_dependencies: number
  total_systems: number
  requiring_review: number
  quantum_vulnerable: number
  high_priority: number
  priority_counts: Record<Priority, number>
  quantum_status_counts: Record<QuantumStatus, number>
  algorithm_family_counts: Record<string, number>
  migration_status_counts: Record<MigrationStatus, number>
  readiness: {
    percent: number
    label: string
    ready_count: number
    migration_in_progress_count: number
    definition: string
  }
}

export interface DashboardData {
  source: 'sample' | 'upload'
  source_label: string
  updated_at: string
  summary: Summary
  top_findings: Finding[]
  disclaimer: string
}

export interface InventoryData {
  source: 'sample' | 'upload'
  source_label: string
  updated_at: string
  records: InventoryRecord[]
  findings: Finding[]
}

export interface RowError {
  row: number | null
  field: string | null
  message: string
}

export interface UploadResult extends InventoryData {
  imported_count: number
  rejected_count: number
  errors: RowError[]
  warnings: string[]
}

export interface ReportData {
  title: string
  generated_at: string
  source: 'sample' | 'upload'
  source_label: string
  inventory_updated_at: string
  disclaimer: string
  summary: Summary
  findings_by_priority: Record<Priority, Finding[]>
  next_actions: { action: string; count: number }[]
  migration_checklist: { phase: string; item: string }[]
}
