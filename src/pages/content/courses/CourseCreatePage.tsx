import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateCourse } from '@/hooks/useCourses'
import { createCourseSchema, type CreateCourseFormValues } from '@/lib/schemas/content.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DOMAIN_CODE_LABELS } from '@/types/content.types'

export function CourseCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateCourse()
  const [domainCodes, setDomainCodes] = useState<string[]>([])

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: '', summary: '', difficulty: 'beginner' },
  })

  const onSubmit = async (values: CreateCourseFormValues) => {
    try {
      const course = await mutateAsync({ ...values, domainCodes })
      toast.success(`Course "${course.title}" created.`)
      navigate(`/content/courses/${course.slug}`)
    } catch {
      toast.error('Failed to create course.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="New Course"
        description="Create an ordered collection of learning rooms."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/content/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Course Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Data Structures Fundamentals" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Brief description…" disabled={isPending} {...field} />
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
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Domains</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DOMAIN_CODE_LABELS).map(([code, label]) => (
                    <Badge
                      key={code}
                      variant={domainCodes.includes(code) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() =>
                        setDomainCodes((prev) =>
                          prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
                        )
                      }
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <FormDescription>Click to toggle domain categories.</FormDescription>
              </div>
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/content/courses')} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
