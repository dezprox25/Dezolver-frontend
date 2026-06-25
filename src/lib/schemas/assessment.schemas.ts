import { z } from 'zod'

export const createAssessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(2000).optional(),
  kind: z.enum(['coding_problem', 'mcq_single', 'mcq_multi', 'short_answer']),
  problemId: z.string().uuid('Invalid problem ID').optional().or(z.literal('')),
  roomId: z.string().uuid('Invalid room ID').optional().or(z.literal('')),
  timeLimitMinutes: z.number().int().positive().max(480).optional(),
  maxAttempts: z.number().int().positive().max(100).optional(),
  collectAntiCheat: z.boolean().optional(),
})

export type CreateAssessmentFormValues = z.infer<typeof createAssessmentSchema>

export const updateAssessmentSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(2000).optional(),
  problemId: z.string().uuid().optional().or(z.literal('')),
  roomId: z.string().uuid().optional().or(z.literal('')),
  timeLimitMinutes: z.number().int().positive().max(480).optional(),
  maxAttempts: z.number().int().positive().max(100).optional(),
  collectAntiCheat: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export type UpdateAssessmentFormValues = z.infer<typeof updateAssessmentSchema>

export const reviewFlaggedSchema = z.object({
  decision: z.enum(['cleared', 'flagged', 'invalidated']),
  note: z.string().max(500).optional(),
})

export type ReviewFlaggedFormValues = z.infer<typeof reviewFlaggedSchema>
