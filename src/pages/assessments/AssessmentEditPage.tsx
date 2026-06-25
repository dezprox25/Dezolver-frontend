import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAssessment, useUpdateAssessment } from '@/hooks/useAssessments'
import {
  updateAssessmentSchema,
  type UpdateAssessmentFormValues,
} from '@/lib/schemas/assessment.schemas'
import { QuestionBuilder } from '@/components/assessment/QuestionBuilder'
import { PageHeader } from '@/components/shared/PageHeader'
import { AssessmentStatusBadge } from '@/components/assessment/AssessmentStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { SUPPORTED_LANGUAGES } from '@/types/assessment.types'
import type { AssessmentQuestion, AssessmentStatus } from '@/types/assessment.types'

export function AssessmentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: assessment, isLoading, isError } = useAssessment(id)
  const { mutateAsync: updateAssessment, isPending } = useUpdateAssessment()

  const form = useForm<UpdateAssessmentFormValues>({
    resolver: zodResolver(updateAssessmentSchema),
    defaultValues: {
      title: '',
      description: '',
      problemId: '',
      roomId: '',
      timeLimitMinutes: undefined,
      maxAttempts: undefined,
      collectAntiCheat: false,
      status: 'draft',
    },
  })

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [partialCredit, setPartialCredit] = useState(false)
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>([])

  useEffect(() => {
    if (!assessment) return
    form.reset({
      title: assessment.title,
      description: assessment.description ?? '',
      problemId: assessment.problemId ?? '',
      roomId: assessment.roomId ?? '',
      timeLimitMinutes: assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes ?? undefined,
      maxAttempts: assessment.maxAttempts ?? assessment.config?.maxAttempts ?? undefined,
      collectAntiCheat: assessment.collectAntiCheat ?? false,
      status: assessment.status ?? 'draft',
    })
    setQuestions(assessment.questions ?? [])
    setPartialCredit(assessment.config?.partialCredit ?? false)
    setAllowedLanguages(assessment.config?.allowedLanguages ?? [])
  }, [assessment, form])

  const toggleLanguage = (lang: string) => {
    setAllowedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const isCoding = assessment?.kind === 'coding_problem'
  const isQuiz = !isCoding

  const onSubmit = async (values: UpdateAssessmentFormValues) => {
    if (!assessment) return
    try {
      await updateAssessment({
        id: assessment.id,
        dto: {
          title: values.title,
          description: values.description || undefined,
          problemId: isCoding ? (values.problemId || undefined) : undefined,
          roomId: values.roomId || undefined,
          timeLimitMinutes: values.timeLimitMinutes,
          maxAttempts: values.maxAttempts,
          collectAntiCheat: values.collectAntiCheat,
          status: values.status,
          questions: isQuiz ? questions : undefined,
        },
      })
      toast.success('Assessment updated.')
      navigate(`/assessments/${assessment.id}`)
    } catch {
      toast.error('Failed to update assessment.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError || !assessment) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Assessment not found.{' '}
        <button className="underline" onClick={() => navigate('/assessments')}>Back</button>
      </div>
    )
  }

  if (assessment.status && assessment.status !== 'draft') {
    return (
      <div className="max-w-xl py-16 mx-auto text-center space-y-3">
        <AssessmentStatusBadge status={assessment.status as AssessmentStatus} />
        <p className="text-sm text-muted-foreground">
          Only <strong>draft</strong> assessments can be edited.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(`/assessments/${assessment.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Edit: ${assessment.title}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/assessments/${assessment.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid sm:grid-cols-2 gap-4">
                {isCoding && (
                  <FormField control={form.control} name="problemId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem ID</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-sm" disabled={isPending} {...field} />
                      </FormControl>
                      <FormDescription>UUID of the target problem.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="roomId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room ID (Optional)</FormLabel>
                    <FormControl>
                      <Input className="font-mono text-sm" disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription>UUID of the room to attach this assessment to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="timeLimitMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (min)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isPending}
                        {...field} value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxAttempts" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attempts</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isPending}
                        {...field} value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Leave blank for unlimited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {isCoding && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Allowed Languages</p>
                  <p className="text-xs text-muted-foreground">Leave all unselected to allow every language.</p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const active = allowedLanguages.includes(lang.value)
                      return (
                        <button
                          key={lang.value}
                          type="button"
                          onClick={() => toggleLanguage(lang.value)}
                          disabled={isPending}
                        >
                          <Badge variant={active ? 'default' : 'outline'} className="cursor-pointer text-xs">
                            {lang.label}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MCQ question editor */}
          {isQuiz && (
            <Card>
              <CardHeader><CardTitle className="text-base">Questions</CardTitle></CardHeader>
              <CardContent>
                <QuestionBuilder
                  questions={questions}
                  onChange={setQuestions}
                  partialCredit={partialCredit}
                  onPartialCreditChange={setPartialCredit}
                  disabled={isPending}
                />
              </CardContent>
            </Card>
          )}

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(`/assessments/${assessment.id}`)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
