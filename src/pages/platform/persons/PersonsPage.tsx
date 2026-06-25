import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { personsService } from '@/services/api/persons.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PersonsPage() {
  const navigate = useNavigate()
  const [personId, setPersonId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    const trimmed = personId.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      await personsService.getById(trimmed)
      navigate(`/platform/persons/${encodeURIComponent(trimmed)}`)
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        toast.error('Person not found.')
      } else {
        toast.error('Lookup failed. Check the ID and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title="Persons"
        description="Look up cross-tenant person records and linked user accounts."
      />

      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          The backend does not expose a persons list endpoint. Look up individual persons by their
          ID from audit logs, tenant invitation records, or the backend database directly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Look Up by Person ID</CardTitle>
          <CardDescription>
            Enter a person ID (ULID format) to view their full profile including all linked tenant
            accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 font-mono text-sm"
                placeholder="01HPERS..."
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLookup()
                }}
              />
            </div>
            <Button onClick={handleLookup} disabled={!personId.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
              <span className="ml-2">Look Up</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Person ID Sources</CardTitle>
          <CardDescription>Where to find person IDs in the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Audit Log</span>
              <span>
                Navigate to{' '}
                <button
                  className="underline text-foreground"
                  onClick={() => navigate('/platform/audit')}
                >
                  Platform → Audit Log
                </button>{' '}
                and inspect actor fields.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Tenants</span>
              <span>
                Open a{' '}
                <button
                  className="underline text-foreground"
                  onClick={() => navigate('/platform/tenants')}
                >
                  Tenant's invitation list
                </button>{' '}
                and find the accepted user's invitation detail for their person ID.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
