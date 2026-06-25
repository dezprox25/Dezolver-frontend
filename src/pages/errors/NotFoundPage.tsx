import { useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
        <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
          <Home className="mr-2 h-4 w-4" />
          {isAuthenticated ? 'Dashboard' : 'Sign in'}
        </Button>
      </div>
    </div>
  )
}
