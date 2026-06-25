import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Plus, Trash2, UserPlus, ListPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateEvent } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CreateEventDto, CompetitionProblem, Speaker, AgendaItem } from '@/types/event.types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  kind: z.enum(['workshop', 'competition']),
  title: z.string().min(3, 'At least 3 characters').max(255),
  description: z.string().max(5000).optional(),
  audienceScope: z.enum(['cohort', 'tenant', 'tenant_open', 'multi_tenant', 'platform']),
  priceInr: z.number().int().positive().optional(),
  registrationOpensAt: z.string().optional(),
  registrationClosesAt: z.string().optional(),
  startsAt: z.string().min(1, 'Start date is required'),
  endsAt: z.string().min(1, 'End date is required'),
  capacity: z.number().int().positive().optional(),
  // Competition fields
  leaderboardVisibleDuringEvent: z.boolean(),
  scoringType: z.enum(['icpc', 'weighted', 'simple']),
  wrongAttemptPenaltyMinutes: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateEvent()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: 'competition',
      title: '',
      description: '',
      audienceScope: 'tenant',
      startsAt: '',
      endsAt: '',
      leaderboardVisibleDuringEvent: true,
      scoringType: 'icpc',
      wrongAttemptPenaltyMinutes: 20,
    },
  })

  const kind = form.watch('kind')
  const audienceScope = form.watch('audienceScope')

  // Competition state
  const [problems, setProblems] = useState<CompetitionProblem[]>([])
  const [problemIdInput, setProblemIdInput] = useState('')

  // Workshop state
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [agenda, setAgenda] = useState<AgendaItem[]>([])

  // --- Competition helpers ---
  const addProblem = () => {
    if (!problemIdInput.trim()) return
    setProblems((prev) => [
      ...prev,
      { problemId: problemIdInput.trim(), points: 100, order: prev.length + 1 },
    ])
    setProblemIdInput('')
  }

  const removeProblem = (idx: number) => {
    setProblems((prev) => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, order: i + 1 })))
  }

  // --- Workshop helpers ---
  const addSpeaker = () => setSpeakers((prev) => [...prev, { name: '' }])
  const removeSpeaker = (idx: number) => setSpeakers((prev) => prev.filter((_, i) => i !== idx))
  const updateSpeaker = (idx: number, field: keyof Speaker, value: string) => {
    setSpeakers((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)))
  }

  const addAgendaItem = () => setAgenda((prev) => [...prev, { time: '', title: '' }])
  const removeAgendaItem = (idx: number) => setAgenda((prev) => prev.filter((_, i) => i !== idx))
  const updateAgendaItem = (idx: number, field: keyof AgendaItem, value: string) => {
    setAgenda((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)))
  }

  // --- Submit ---
  const onSubmit = async (values: FormValues) => {
    const dto: CreateEventDto = {
      kind: values.kind,
      title: values.title,
      description: values.description || undefined,
      audienceScope: values.audienceScope,
      audienceFilter:
        values.audienceScope === 'tenant_open' && values.priceInr
          ? { priceInr: values.priceInr }
          : undefined,
      registrationOpensAt: values.registrationOpensAt || undefined,
      registrationClosesAt: values.registrationClosesAt || undefined,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      capacity: values.capacity,
      config:
        values.kind === 'competition'
          ? {
              problems: problems.length > 0 ? problems : undefined,
              scoring: {
                type: values.scoringType,
                wrongAttemptPenaltyMinutes: values.wrongAttemptPenaltyMinutes,
              },
              leaderboardVisibleDuringEvent: values.leaderboardVisibleDuringEvent,
            }
          : {
              speakers: speakers.filter((s) => s.name.trim()).length > 0
                ? speakers.filter((s) => s.name.trim())
                : undefined,
              agenda: agenda.filter((a) => a.title.trim() && a.time.trim()).length > 0
                ? agenda.filter((a) => a.title.trim() && a.time.trim())
                : undefined,
            },
    }

    try {
      const event = await mutateAsync(dto)
      toast.success(`Event "${event.title}" created.`)
      navigate(`/events/${event.id}`)
    } catch {
      toast.error('Failed to create event.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Event"
        description="Set up a workshop or competition."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Basic info ──────────────────────────────────────────── */}
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="kind" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="audienceScope" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audience</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cohort">Cohort</SelectItem>
                        <SelectItem value="tenant">Institution</SelectItem>
                        <SelectItem value="tenant_open">Open (External Paid)</SelectItem>
                        <SelectItem value="multi_tenant">Multi-Institution</SelectItem>
                        <SelectItem value="platform">Platform-Wide</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Paid registration price */}
              {audienceScope === 'tenant_open' && (
                <FormField control={form.control} name="priceInr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Registration Fee (₹ INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 499"
                        disabled={isPending}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank for free. External (non-tenant) participants will be charged this fee via Razorpay.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Friday Algorithms Challenge #14" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Event description…" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Schedule ────────────────────────────────────────────── */}
          <Card>
            <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="registrationOpensAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Opens</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="registrationClosesAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Closes</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="startsAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At *</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endsAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends At *</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        disabled={isPending}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Leave blank for unlimited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Competition config ───────────────────────────────────── */}
          {kind === 'competition' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Competition Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="scoringType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scoring</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="icpc">ICPC (time-based)</SelectItem>
                          <SelectItem value="weighted">Weighted points</SelectItem>
                          <SelectItem value="simple">Simple (solved count)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="wrongAttemptPenaltyMinutes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wrong Attempt Penalty (min)</FormLabel>
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
                  )} />
                </div>

                <FormField control={form.control} name="leaderboardVisibleDuringEvent" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>Show leaderboard during event</FormLabel>
                      <FormDescription>Participants can see live rankings.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )} />

                {/* Problems */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Problems</p>
                  {problems.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <span className="text-xs font-mono text-muted-foreground w-5">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm flex-1 font-mono truncate">{p.problemId}</span>
                      <Input
                        type="number"
                        className="w-20 h-7 text-xs"
                        value={p.points}
                        onChange={(e) =>
                          setProblems((prev) =>
                            prev.map((prob, j) =>
                              j === i ? { ...prob, points: Number(e.target.value) } : prob
                            )
                          )
                        }
                      />
                      <span className="text-xs text-muted-foreground">pts</span>
                      <Button
                        type="button" variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => removeProblem(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      className="font-mono text-sm h-8"
                      placeholder="Problem UUID…"
                      value={problemIdInput}
                      onChange={(e) => setProblemIdInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProblem() } }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addProblem}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Workshop config ──────────────────────────────────────── */}
          {kind === 'workshop' && (
            <>
              {/* Speakers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Speakers</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Speaker
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {speakers.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No speakers added. Click "Add Speaker" to include speaker profiles.
                    </p>
                  )}
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3 relative">
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="absolute right-2 top-2 h-7 w-7"
                        onClick={() => removeSpeaker(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Name *</Label>
                          <Input
                            placeholder="Dr. Priya Sharma"
                            value={speaker.name}
                            onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Title / Role</Label>
                          <Input
                            placeholder="Professor, NIT Trichy"
                            value={speaker.title ?? ''}
                            onChange={(e) => updateSpeaker(idx, 'title', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Bio</Label>
                        <Textarea
                          rows={2}
                          placeholder="Brief speaker bio…"
                          value={speaker.bio ?? ''}
                          onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Avatar URL</Label>
                        <Input
                          placeholder="https://…"
                          value={speaker.avatarUrl ?? ''}
                          onChange={(e) => updateSpeaker(idx, 'avatarUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agenda */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Agenda</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                    <ListPlus className="h-3.5 w-3.5 mr-1" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agenda.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No agenda items yet. Click "Add Item" to build the schedule.
                    </p>
                  )}
                  {agenda.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid sm:grid-cols-3 gap-2">
                        <Input
                          placeholder="10:00 AM"
                          value={item.time}
                          onChange={(e) => updateAgendaItem(idx, 'time', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Opening Keynote"
                          value={item.title}
                          onChange={(e) => updateAgendaItem(idx, 'title', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Speaker name (optional)"
                          value={item.speakerName ?? ''}
                          onChange={(e) => updateAgendaItem(idx, 'speakerName', e.target.value)}
                          className="text-sm"
                        />
                        <div className="sm:col-span-3">
                          <Input
                            placeholder="Brief description (optional)"
                            value={item.description ?? ''}
                            onChange={(e) => updateAgendaItem(idx, 'description', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        type="button" variant="ghost" size="icon" className="h-7 w-7 mt-1 shrink-0"
                        onClick={() => removeAgendaItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/events')} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
