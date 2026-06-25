import { VerdictPanel } from './VerdictPanel'
import type { Submission } from '@/types/assessment.types'

interface SubmissionPanelProps {
  submission: Submission | null
  isLoading?: boolean
}

/**
 * Wrapper panel for submission verdict — used in the workspace result area
 * and can be embedded in other contexts that need a compact verdict view.
 */
export function SubmissionPanel({ submission, isLoading }: SubmissionPanelProps) {
  return <VerdictPanel submission={submission} isLoading={isLoading} />
}
