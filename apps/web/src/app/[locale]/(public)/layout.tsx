import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page-dark min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
