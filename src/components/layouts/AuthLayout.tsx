import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { authService } from '@/services/api/auth.service'
import type { TenantBrandingPublic } from '@/types/auth.types'

function detectSubdomain(): string | null {
  const host = window.location.hostname
  const parts = host.split('.')
  // Require at least 3 parts (subdomain.domain.tld) and filter generic subdomains
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'localhost') {
    return parts[0]
  }
  return null
}

function injectBrandingVariables(branding: TenantBrandingPublic) {
  const root = document.documentElement
  if (branding.branding?.primaryColor) {
    // Convert hex to HSL for Tailwind CSS variable compatibility
    root.style.setProperty('--tenant-primary', branding.branding.primaryColor)
  }
  if (branding.branding?.faviconUrl) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (favicon) favicon.href = branding.branding.faviconUrl
  }
}

export function AuthLayout() {
  const [branding, setBranding] = useState<TenantBrandingPublic | null>(null)

  useEffect(() => {
    const subdomain = detectSubdomain()
    if (!subdomain) return

    authService.getTenantBranding(subdomain).then((data) => {
      if (!data) return
      setBranding(data)
      injectBrandingVariables(data)
    })
  }, [])

  const displayName = branding?.name ?? 'Dezolver'
  const logoUrl = branding?.branding?.logoUrl

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary p-12">
        <div className="max-w-md text-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayName}
              className="mx-auto mb-6 h-16 w-auto object-contain"
            />
          ) : (
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          )}

          <h1 className="text-3xl font-bold text-primary-foreground mb-3">{displayName}</h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            {branding
              ? `Welcome to ${displayName} on Dezolver. Sign in to continue your learning journey.`
              : 'The LMS built for Indian higher education. Learn, build, and prove your skills.'}
          </p>

          {!branding && (
            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              {[
                { label: 'Colleges', value: '50+' },
                { label: 'Students', value: '10K+' },
                { label: 'Problems', value: '500+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-sm text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={displayName} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <GraduationCap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold">{displayName}</span>
              </>
            )}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
