import { useNavigate } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this page. Contact your administrator if you
          believe this is a mistake.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
        <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Sign in'}
        </Button>
      </div>
    </div>
  )
}
