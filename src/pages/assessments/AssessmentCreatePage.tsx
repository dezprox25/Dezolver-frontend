import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateAssessment } from '@/hooks/useAssessments'
import {
  createAssessmentSchema,
  type CreateAssessmentFormValues,
} from '@/lib/schemas/assessment.schemas'
import { QuestionBuilder } from '@/components/assessment/QuestionBuilder'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_LANGUAGES } from '@/types/assessment.types'
import type { AssessmentQuestion } from '@/types/assessment.types'

export function AssessmentCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateAssessment()

  const form = useForm<CreateAssessmentFormValues>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      title: '',
      description: '',
      kind: 'coding_problem',
      problemId: '',
      roomId: '',
      timeLimitMinutes: 90,
      maxAttempts: undefined,
      collectAntiCheat: false,
    },
  })

  const kind = form.watch('kind')
  const isCoding = kind === 'coding_problem'
  const isQuiz = !isCoding

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [partialCredit, setPartialCredit] = useState(false)
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>([])

  const toggleLanguage = (lang: string) => {
    setAllowedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const onSubmit = async (values: CreateAssessmentFormValues) => {
    try {
      const assessment = await mutateAsync({
        title: values.title,
        description: values.description || undefined,
        kind: values.kind,
        problemId: isCoding && values.problemId ? values.problemId : undefined,
        roomId: values.roomId ? values.roomId : undefined,
        timeLimitMinutes: values.timeLimitMinutes,
        maxAttempts: values.maxAttempts,
        collectAntiCheat: values.collectAntiCheat,
        questions: isQuiz && questions.length > 0 ? questions : undefined,
      })
      toast.success(`Assessment "${assessment.title}" created.`)
      navigate(`/assessments/${assessment.id}`)
    } catch {
      toast.error('Failed to create assessment.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="New Assessment"
        description="Create a coding challenge or quiz."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
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
                  <FormControl>
                    <Input placeholder="Week 3 Coding Challenge" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Brief instructions for students…" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="kind" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={(v) => { field.onChange(v); setQuestions([]) }} disabled={isPending}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="coding_problem">Coding Problem</SelectItem>
                        <SelectItem value="mcq_single">MCQ (Single Choice)</SelectItem>
                        <SelectItem value="mcq_multi">MCQ (Multi Choice)</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Problem ID (coding only) */}
                {isCoding && (
                  <FormField control={form.control} name="problemId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem ID</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-sm" placeholder="UUID of the problem…" disabled={isPending} {...field} />
                      </FormControl>
                      <FormDescription>UUID of the published problem in the Content Catalog.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {/* Room ID */}
                <FormField control={form.control} name="roomId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room ID (Optional)</FormLabel>
                    <FormControl>
                      <Input className="font-mono text-sm" placeholder="UUID of the room…" disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription>UUID of the room to attach this assessment to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Collect Anti-Cheat Signals */}
              <FormField control={form.control} name="collectAntiCheat" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Collect Anti-Cheat Signals</FormLabel>
                    <FormDescription>
                      Collects signals like tab switches, paste events, and time spent.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                  </FormControl>
                </FormItem>
              )} />
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
                      <Input type="number" placeholder="90" disabled={isPending}
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
                      <Input type="number" placeholder="Unlimited" disabled={isPending}
                        {...field} value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Leave blank for unlimited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Allowed languages (coding only) */}
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
                          <Badge
                            variant={active ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                          >
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

          {/* MCQ Question builder */}
          {isQuiz && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
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
            <Button type="button" variant="outline" onClick={() => navigate('/assessments')} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Assessment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
