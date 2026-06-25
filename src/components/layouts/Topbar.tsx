import { useNavigate } from 'react-router-dom'
import { LogOut, LogOutIcon, Settings, Sun, Moon, Monitor, Menu, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { authService } from '@/services/api/auth.service'
import { normalizeMeResponse } from '@/types/auth.types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationCenter } from '@/components/dashboard/notifications/NotificationCenter'
import { Sidebar } from './Sidebar'
import { formatInitials } from '@/lib/utils/format'
import { ROLE_LABELS } from '@/lib/permissions/roles'

type Theme = 'light' | 'dark' | 'system'

const themeIcons: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function Topbar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, linkedUsers, logout, setFullAuth, setAccessToken } = useAuthStore()
  const { theme, setTheme } = useSettingsStore()

  const ThemeIcon = themeIcons[theme]
  const nextTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

  // Other accounts the user can switch to (excludes the current one)
  const switchableAccounts = linkedUsers.filter((lu) => lu.userId !== user?.id)

  const handleLogout = async () => {
    await authService.logout()
    queryClient.clear()
    logout()
    toast.success('Signed out successfully')
    navigate('/login', { replace: true })
  }

  const handleLogoutAll = async () => {
    await authService.logoutAll()
    queryClient.clear()
    logout()
    toast.success('Signed out of all devices')
    navigate('/login', { replace: true })
  }

  const handleSwitchAccount = async (targetUserId: string) => {
    try {
      const auth = await authService.switchUser({ targetUserId })
      setAccessToken(auth.accessToken)
      try {
        const me = await authService.getFullProfile()
        const normalized = normalizeMeResponse(me)
        setFullAuth(normalized, auth.accessToken, me.tenant, me.subscription, me.linkedUsers)
        queryClient.clear()
      } catch {
        // Non-fatal: use the user object from the switch response
        setFullAuth(
          auth.user,
          auth.accessToken,
          // Tenant/subscription are not in AuthResponse — rely on subsequent /me fetch
          { id: auth.user.tenantId, kind: auth.user.tenantKind, name: '', subdomain: '', branding: {} },
          { planCode: 'starter', status: 'active' },
          auth.linkedUsers
        )
        queryClient.clear()
      }
      toast.success(`Switched to ${auth.user.fullName}`)
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Failed to switch account. Please try again.')
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(nextTheme)}>
          <ThemeIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notification center */}
        <NotificationCenter />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user ? formatInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName ?? 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email}
                </p>
                {user && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {ROLE_LABELS[user.primaryRole]}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            {/* Account switcher — only shown when linked accounts exist */}
            {switchableAccounts.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Switch account
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {switchableAccounts.map((account) => (
                    <DropdownMenuItem
                      key={account.userId}
                      onClick={() => handleSwitchAccount(account.userId)}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm truncate">{account.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {account.tenantKind === 'direct' ? 'Direct account' : 'College account'}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogoutAll}
              className="text-destructive focus:text-destructive"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign out all devices
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
