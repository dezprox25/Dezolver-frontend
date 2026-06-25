import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { JudgeRun } from '@/types/assessment.types'

/**
 * Judge service — wraps raw Judge0 result endpoints.
 * The actual code execution pipeline is async (API → BullMQ → Judge0 → WebSocket).
 * This service only exposes the read side: fetching JudgeRun records.
 */
export const judgeService = {
  /** GET /submissions/:submissionId/judge-run — raw Judge0 result (faculty/admin) */
  async getJudgeRun(submissionId: string): Promise<JudgeRun> {
    const res = await apiClient.get<ApiSuccess<JudgeRun>>(
      `/submissions/${encodeURIComponent(submissionId)}/judge-run`
    )
    return res.data.data
  },
}
