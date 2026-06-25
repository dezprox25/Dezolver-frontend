import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
  tenantHint: z.string().max(64).optional(),
  rememberMe: z.boolean(),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128)
    .refine(
      (p) =>
        ((/[a-z]/.test(p) ? 1 : 0) +
          (/[A-Z]/.test(p) ? 1 : 0) +
          (/\d/.test(p) ? 1 : 0) +
          (/[^A-Za-z0-9]/.test(p) ? 1 : 0)) >= 3,
      'Must include at least 3 of: lowercase, uppercase, digit, symbol'
    ),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128),
    confirmPassword: z.string(),
    token: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const mfaVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must be numeric only'),
  mfaToken: z.string().min(1),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type MfaVerifyFormValues = z.infer<typeof mfaVerifySchema>
