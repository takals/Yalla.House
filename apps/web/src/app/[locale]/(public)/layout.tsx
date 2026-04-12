import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page-dark min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
