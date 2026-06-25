import { z } from 'zod'

const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const
const problemDifficulties = ['easy', 'medium', 'hard'] as const

export const createRoomSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  summary: z.string().max(500).optional(),
  difficulty: z.enum(difficulties),
  estimatedMinutes: z.number().int().positive().max(600).optional(),
  domainCodes: z.array(z.string()).optional(),
  skillTags: z.array(z.string()).optional(),
})

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  summary: z.string().max(500).optional(),
  difficulty: z.enum(difficulties),
  domainCodes: z.array(z.string()).optional(),
  skillTags: z.array(z.string()).optional(),
})

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>

export const createProblemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  difficulty: z.enum(problemDifficulties),
  topics: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  statementMd: z.string().min(10, 'Problem statement is required').max(10000),
  inputFormat: z.string().max(2000).optional(),
  outputFormat: z.string().max(2000).optional(),
  constraints: z.string().max(2000).optional(),
  allowedLanguages: z.array(z.string()).optional(),
  timeLimitMs: z.number().int().min(100).max(10000).optional(),
  memoryLimitMb: z.number().int().min(16).max(512).optional(),
})

export type CreateProblemFormValues = z.infer<typeof createProblemSchema>

export const addTestCaseSchema = z.object({
  input: z.string().max(10000),
  expectedOutput: z.string().max(10000),
  isSample: z.boolean(),
  weight: z.number().min(1).max(100).optional(),
  explanation: z.string().max(500).optional(),
})

export type AddTestCaseFormValues = z.infer<typeof addTestCaseSchema>
