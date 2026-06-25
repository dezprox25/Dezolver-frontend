import { MoreHorizontal, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Certificate } from '@/types/certificate.types'

interface CertificateActionMenuProps {
  certificate: Certificate
  canRevoke: boolean
  canReissue: boolean
  onRevoke?: () => void
  onReissue?: () => void
  disabled?: boolean
}

export function CertificateActionMenu({
  certificate,
  canRevoke,
  canReissue,
  onRevoke,
  onReissue,
  disabled,
}: CertificateActionMenuProps) {
  if (!canRevoke && !canReissue) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} aria-label="Certificate actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canReissue && certificate.status === 'issued' && onReissue && (
          <DropdownMenuItem onClick={onReissue}>
            <RotateCcw className="mr-2 h-4 w-4 text-blue-600" />
            Reissue
          </DropdownMenuItem>
        )}
        {canRevoke && certificate.status !== 'revoked' && onRevoke && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onRevoke}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Revoke
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
