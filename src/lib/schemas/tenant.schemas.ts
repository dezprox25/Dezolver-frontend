import { z } from 'zod'

const subdomainRe = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/

export const createTenantSchema = z.object({
  kind: z.enum(['college', 'direct']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(64)
    .regex(subdomainRe, 'Only lowercase letters, digits, and hyphens; cannot start/end with a hyphen'),
  primaryContactEmail: z.string().email('Invalid email address').max(255),
  primaryDomain: z.string().min(2).max(64),
  expectedStudentCount: z.number().int().positive().optional(),
  planCode: z.enum(['starter', 'professional', 'enterprise', 'unlimited']),
})

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  subdomain: z
    .string()
    .min(3)
    .max(64)
    .regex(subdomainRe)
    .optional(),
  primaryContactEmail: z.string().email().max(255).optional(),
})

export type UpdateTenantFormValues = z.infer<typeof updateTenantSchema>

export const transitionTenantSchema = z.object({
  to: z.enum(['trial', 'active', 'suspended', 'cancelled', 'expired']),
  reason: z.string().max(255).optional(),
  actorJustification: z.string().min(1, 'Justification is required').max(1000),
})

export type TransitionTenantFormValues = z.infer<typeof transitionTenantSchema>

export const createCohortSchema = z.object({
  name: z.string().min(2, 'Cohort name must be at least 2 characters').max(100),
  academicYear: z.string().max(20).optional(),
})

export type CreateCohortFormValues = z.infer<typeof createCohortSchema>

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  role: z.enum(['student', 'faculty', 'coordinator', 'college_admin']),
  cohortId: z.string().uuid('Invalid cohort ID').nullable().optional(),
})

export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>
