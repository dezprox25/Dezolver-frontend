import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateProblem } from '@/hooks/useProblems'
import { contentService } from '@/services/api/content.service'
import { createProblemSchema, type CreateProblemFormValues } from '@/lib/schemas/content.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALLOWED_LANGUAGES } from '@/types/content.types'

interface TestCaseInput {
  input: string
  expectedOutput: string
  isSample: boolean
  explanation: string
}

export function ProblemCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync: createProblem, isPending } = useCreateProblem()
  const [testCases, setTestCases] = useState<TestCaseInput[]>([
    { input: '', expectedOutput: '', isSample: true, explanation: '' },
  ])
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [languages, setLanguages] = useState<string[]>(['python', 'java', 'cpp'])

  const form = useForm<CreateProblemFormValues>({
    resolver: zodResolver(createProblemSchema),
    defaultValues: {
      title: '',
      difficulty: 'easy',
      statementMd: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
    },
  })

  const addTopic = () => {
    const t = topicInput.trim().toLowerCase()
    if (t && !topics.includes(t)) {
      setTopics([...topics, t])
      setTopicInput('')
    }
  }

  const onSubmit = async (values: CreateProblemFormValues) => {
    let createdProblemSlug: string | null = null
    let createdProblemId: string | null = null

    try {
      const problem = await createProblem({
        ...values,
        topics,
        allowedLanguages: languages,
      })
      createdProblemSlug = problem.slug
      createdProblemId = problem.id
    } catch {
      toast.error('Failed to create problem. Nothing was saved.')
      return
    }

    // Problem exists — now add test cases individually.
    // Failures here are non-fatal: the problem is already created.
    const casesToAdd = testCases.filter((t) => t.input || t.expectedOutput)
    const failed: number[] = []

    for (let i = 0; i < casesToAdd.length; i++) {
      const tc = casesToAdd[i]
      try {
        await contentService.addTestCase(createdProblemId, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          explanation: tc.explanation || undefined,
          weight: 1,
        })
      } catch {
        failed.push(i + 1)
      }
    }

    if (failed.length === 0) {
      toast.success('Problem created successfully.')
    } else {
      toast.warning(
        `Problem created, but test case${failed.length > 1 ? 's' : ''} ${failed.join(', ')} failed to save. ` +
          `Open the problem to add them manually. Problem ID: ${createdProblemId}`,
        { duration: 8000 }
      )
    }

    navigate(`/content/problems/${createdProblemSlug}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="New Problem"
        description="Create a coding challenge or MCQ."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/content/problems')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle className="text-base">Problem Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Two Sum" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Topics</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="arrays, dynamic-programming…"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTopic}>Add</Button>
                </div>
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setTopics(topics.filter((x) => x !== t))}
                      >
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Allowed Languages</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_LANGUAGES.map((lang) => (
                    <Badge
                      key={lang}
                      variant={languages.includes(lang) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() =>
                        setLanguages((prev) =>
                          prev.includes(lang)
                            ? prev.filter((l) => l !== lang)
                            : [...prev, lang]
                        )
                      }
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeLimitMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoryLimitMb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory Limit (MB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statement */}
          <Card>
            <CardHeader><CardTitle className="text-base">Problem Statement (Markdown)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="statementMd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement</FormLabel>
                    <FormControl>
                      <Textarea rows={8} className="font-mono text-sm" placeholder="Given an array nums..." disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription>Supports Markdown. LaTeX math using $...$.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inputFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Format</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="First line: n — array size…" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outputFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Format</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Print the answer on a single line…" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="constraints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constraints</FormLabel>
                    <FormControl>
                      <Textarea rows={3} className="font-mono text-sm" placeholder="1 ≤ n ≤ 10^5..." disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Test cases */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Test Cases</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTestCases([...testCases, { input: '', expectedOutput: '', isSample: false, explanation: '' }])
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((tc, idx) => (
                <div key={idx} className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test Case {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-sm">
                        <Switch
                          checked={tc.isSample}
                          onCheckedChange={(v) =>
                            setTestCases(testCases.map((t, i) => (i === idx ? { ...t, isSample: v } : t)))
                          }
                        />
                        Sample
                      </label>
                      {testCases.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Input</p>
                      <Textarea
                        rows={3}
                        className="font-mono text-xs"
                        placeholder="3\n1 2 3"
                        value={tc.input}
                        onChange={(e) =>
                          setTestCases(testCases.map((t, i) => (i === idx ? { ...t, input: e.target.value } : t)))
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Expected Output</p>
                      <Textarea
                        rows={3}
                        className="font-mono text-xs"
                        placeholder="6"
                        value={tc.expectedOutput}
                        onChange={(e) =>
                          setTestCases(testCases.map((t, i) => (i === idx ? { ...t, expectedOutput: e.target.value } : t)))
                        }
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Explanation (optional)"
                    value={tc.explanation}
                    onChange={(e) =>
                      setTestCases(testCases.map((t, i) => (i === idx ? { ...t, explanation: e.target.value } : t)))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/content/problems')} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Problem
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

