# Frontend / Vanilla HTML + CSS Rules

## Design Tokens (`style.css :root`)

### Colours
| Token | Value | Usage |
|---|---|---|
| `--brand` | `#FFD400` | Yalla Yellow — primary accent, CTAs, active states |
| `--brand-hover` | `#E6C200` | Button hover |
| `--brand-light` | `rgba(255,212,0,.12)` | Focus rings, active sidebar bg |
| `--brand-light2` | `rgba(255,212,0,.18)` | Stronger brand tint |
| `--brand-solid-bg` | `#FFFBE0` | Soft yellow tint — card icons, featured cards |
| `--bg` | `#EDEEF2` | Page background — cool grey (clearly not white) |
| `--bg-soft` | `#E6E8EE` | Alt sections, sidebar bg |
| `--bg-muted` | `#D9DCE4` | Hover states, muted fills |
| `--bg-subtle` | `#CDD1DA` | Dividers, subtle highlights |
| `--surface` | `#ffffff` | Cards, panels, inputs |
| `--border-light` | `#E2E4EB` | Subtle dividers |
| `--border` | `#D8DBE5` | Default borders |
| `--border-dark` | `#C8CCD6` | Hover border states |
| `--text-primary` | `#000000` | Body text, headings |
| `--text-secondary` | `#656565` | Supporting text, labels |
| `--text-muted` | `#999999` | Placeholders, meta text |

### Shadows (dual-layer system)
| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` |
| `--shadow` | `0 2px 8px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)` |
| `--shadow-md` | `0 6px 20px rgba(0,0,0,.09), 0 2px 6px rgba(0,0,0,.05)` |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.11), 0 4px 12px rgba(0,0,0,.06)` |

### Radii
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Buttons, inputs, chips |
| `--radius` | `10px` | Cards, badges |
| `--radius-lg` | `14px` | Section cards, panels |
| `--radius-xl` | `20px` | Pricing cards, large modals |

### Layout
| Token | Value |
|---|---|
| `--sidebar-w` | `240px` |
| `--header-h` | `60px` |
| `--section-pad-x` | `48px` |
| `--transition` | `0.15s ease` |

---

## Typography Hierarchy
```
Page H1 (hero):  clamp(2.25rem, 5.5vw, 3.875rem) · weight 800 · tracking -.035em
Section H2:      clamp(1.625rem, 3vw, 2.25rem)   · weight 800 · tracking -.03em
Card H3:         .9375rem                         · weight 700 · tracking -.01em
Label / nav:     .875rem                          · weight 600
Body text:       .9375rem                         · weight 400 · line-height 1.65
Small / meta:    .8125rem                         · weight 400–600 · color --text-secondary
Tiny / badge:    .7rem or .75rem                  · weight 700 · uppercase + tracking
```

---

## Component Specs

### Buttons
- `.btn-primary` — Brand yellow bg, black text. Hover: `translateY(-1px)` + yellow glow shadow
- `.btn-secondary` — Grey bg, dark border. Hover: lift + subtle shadow
- `.btn-outline` — Transparent + border. Hover: border darkens + lift
- `.btn-ghost` — No bg, muted text. Hover: grey bg fill
- Sizes: `.btn` (default), `.btn-lg`, `.btn-sm`
- All buttons: `will-change: transform`, `:active` resets to `translateY(0)`

### Cards
- `--surface` bg · `--border-light` border · `--radius-lg` radius
- Hover: `translateY(-3px)` + `--shadow-md`
- `.card-icon`: 44×44px, `--brand-solid-bg` bg with brand border tint

### Badges
```
.badge-green   → #DCFCE7 / #166534   active, live, confirmed
.badge-yellow  → --brand-solid-bg / #7A5F00   pending, under review
.badge-blue    → #DBEAFE / #1E40AF   info, in-progress
.badge-red     → #FEE2E2 / #991B1B   urgent, error, declined
.badge-gray    → --bg-muted / --text-secondary   inactive, draft
```

### Testimonials
- `::before` renders a large `"` quote mark in brand yellow (Georgia, 3.75rem)
- `.testimonial-stars` — amber `#F59E0B` five-star row, placed before quote text in HTML
- Left border `3px solid transparent` animates to `var(--brand)` on hover

### Portal Logo Strip (`.portal-logo`)
Pill badge style: white bg · `var(--border)` border · `border-radius: 100px`
Not plain faded text — always render as a badge.

### CTA Band (`.cta-band`)
Dark `#0d0d0d` background. `::before` pseudo-element adds `radial-gradient` yellow glow.
Headline `#ffffff`, body text `rgba(255,255,255,.62)`. Dark and dramatic — not soft yellow.

### Pricing Checkmarks
`.pricing-features li::before` — 17px circle · `#D1FAE5` bg · `#059669` green tick

### Public Header (`.site-header`)
- Sticky glass: `background: rgba(237,238,242,.88)` + `backdrop-filter: blur(14px)`
  *(matches `--bg` exactly — update both if background changes)*
- Nav links: underline slide-in on hover via `::after`
- Right of nav: `.user-menu` dropdown + "List Your Place" primary btn
- Nav items: `[Services & Pricing]` `[About]` — no Contact

### User Menu Dropdown (`.user-menu`)
Used on all 3 public pages. Inline JS: `toggleUserMenu()`, `showToast()`, click-outside handler.
Structure: `.user-menu` > button `onclick="toggleUserMenu()"` > `.user-menu-dropdown` with `.user-menu-option` role cards + `.user-menu-action` buttons at bottom.

### Lucide Icons
- Dashboard sidebar: `<i data-lucide="name" class="sidebar-icon">` — 15×15px, `stroke: currentColor`
- Active state inherits `color: var(--brand)` via `.sidebar-link.active .sidebar-icon`
- Always call `lucide.createIcons()` inside `DOMContentLoaded`
