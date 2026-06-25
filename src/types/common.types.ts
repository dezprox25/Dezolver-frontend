export type Status =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'completed'
  | 'draft'
  | 'published'
  | 'archived'
  | 'trial'

export type Severity = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  severity: Severity
  read: boolean
  createdAt: string
  link?: string
}

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface TableColumn<TData> {
  key: keyof TData | string
  header: string
  sortable?: boolean
  render?: (row: TData) => React.ReactNode
}

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange'
  options?: SelectOption[]
}

// Re-export React for components that need ReactNode type
import type { ReactNode } from 'react'
export type { ReactNode }
