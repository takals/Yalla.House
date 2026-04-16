'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface Props {
  links: { href: string; label: string }[]
  cta: { href: string; label: string; isLoggedIn: boolean }
}

export function HeaderNav({ links, cta }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-8">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[0.95rem] text-white hover:text-brand-hover transition-[color] duration-[400ms]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
          >
            {link.label}
          </Link>
        ))}
        {cta.isLoggedIn ? (
          <Link
            href={cta.href}
            className="text-[0.95rem] font-semibold text-white bg-brand hover:bg-brand-hover px-6 py-2.5 rounded-lg transition-[background-color] duration-300 whitespace-nowrap"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {cta.label}
          </Link>
        ) : (
          <Link
            href={cta.href}
            className="text-[0.95rem] font-semibold text-white border border-white/20 hover:border-brand hover:text-brand px-5 py-2 rounded-lg transition-all duration-300 whitespace-nowrap"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {cta.label}
          </Link>
        )}
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="sm:hidden p-2 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-white/10 p-4 space-y-3 z-50">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            onClick={() => setMobileOpen(false)}
            className={
              cta.isLoggedIn
                ? 'block py-2 text-white font-semibold bg-brand rounded-lg px-4 text-center'
                : 'block py-2 text-white font-semibold border border-white/20 rounded-lg px-4 text-center'
            }
          >
            {cta.label}
          </Link>
        </div>
      )}
    </>
  )
}
