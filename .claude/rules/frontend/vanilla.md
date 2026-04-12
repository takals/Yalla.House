# Frontend / Vanilla HTML + CSS Rules

## Dual-Theme System

Public pages (`index.html`, `services.html`, `about.html`, `list.html`) use **dark mode** by default (`:root` tokens).
Dashboard pages (`dashboards/*.html`) use **light mode** via `body.light-page` class override.

## Design Tokens (`style.css :root`) — Dark Public Pages (default)

### Brand Colours
| Token | Value | Usage |
|---|---|---|
| `--brand` | `#D4764E` | Terracotta Orange — primary accent, CTAs, active states |
| `--brand-hover` | `#BF6840` | Button hover |
| `--brand-deep` | `#A85A36` | Deep brand for emphasis |
| `--brand-light` | `rgba(212,118,78,.10)` | Focus rings, active sidebar bg |
| `--brand-light2` | `rgba(212,118,78,.16)` | Stronger brand tint |
| `--brand-solid-bg` | `#FFF4EF` | Soft orange tint — card icons, featured cards |

### Dark Page Tokens (`:root` defaults)
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0D0D0D` | Near-black page background |
| `--bg-soft` | `#141414` | Alt sections |
| `--bg-muted` | `#1A1A1A` | Hover states, muted fills |
| `--bg-subtle` | `#222222` | Dividers, subtle highlights |
| `--surface` | `#161616` | Cards, panels |
| `--border-light` | `rgba(255,255,255,.06)` | Subtle dividers |
| `--border` | `rgba(255,255,255,.10)` | Default borders |
| `--border-dark` | `rgba(255,255,255,.16)` | Hover border states |
| `--text-primary` | `#FFFFFF` | Body text, headings |
| `--text-secondary` | `rgba(255,255,255,.62)` | Supporting text, labels |
| `--text-muted` | `rgba(255,255,255,.40)` | Placeholders, meta text |

### Light Dashboard Tokens (`body.light-page` override)
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F8FAFC` | Light page background |
| `--bg-soft` | `#F1F5F9` | Alt sections, sidebar bg |
| `--bg-muted` | `#E2E8F0` | Hover states |
| `--surface` | `#FFFFFF` | Cards, panels, inputs |
| `--border-light` | `#EFF2F7` | Subtle dividers |
| `--border` | `#E2E8F0` | Default borders |
| `--text-primary` | `#1E293B` | Body text, headings |
| `--text-secondary` | `#64748B` | Supporting text |

### Shadows (dual-layer system)
| Token | Dark Value | Light Value |
|---|---|---|
| `--shadow-sm` | heavier opacity for dark surfaces | subtle for light surfaces |
| `--shadow-brand` | orange-based `rgba(212,118,78,...)` | same orange glow |

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
| `--transition` | `0.18s cubic-bezier(0.16, 1, 0.3, 1)` |

---

## Typography Hierarchy
Font: **Outfit** (Google Fonts)
```
Display H1:  clamp(2.75rem, 6vw, 4.5rem)   · weight 800 · tracking -.022em
Title H2:    clamp(2rem, 4vw, 3rem)          · weight 800 · tracking -.018em
Title-2:     clamp(1.5rem, 2.4vw, 2rem)      · weight 700
Headline:    1.0625rem                        · weight 700 · tracking -.01em
Lede:        1.1875rem                        · weight 400 · line-height 1.5
Body:        .9375rem                         · weight 400 · line-height 1.5
Caption:     .8125rem                         · weight 400–600
Eyebrow:     .75rem                           · weight 700 · uppercase + tracking
```

---

## Component Specs

### Buttons
- `.btn-primary` — Brand orange bg, **white text**. Hover: `translateY(-1px)` + orange glow shadow
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
- `::before` renders a large `"` quote mark in brand orange (Georgia, 3.75rem)
- `.testimonial-stars` — amber `#F59E0B` five-star row
- Left border `3px solid transparent` animates to `var(--brand)` on hover

### Portal Logo Strip (`.portal-logo`)
Pill badge style: white bg · `var(--border)` border · `border-radius: 100px`

### CTA Band (`.cta-band`)
Dark `#0d0d0d` background. `::before` pseudo-element adds `radial-gradient` orange glow.
Headline `#ffffff`, body text `rgba(255,255,255,.62)`.

### Pricing Checkmarks
`.pricing-features li::before` — 17px circle · `#D1FAE5` bg · `#059669` green tick

### Public Header (`.site-header`)
- Sticky dark glass: `background: rgba(13,13,13,0.75)` + `backdrop-filter: blur(16px)`
- Brand name in orange (`--brand`)
- Nav links: white/light, underline slide-in on hover via `::after`
- Right of nav: `.user-menu` dropdown + "List Your Place" primary btn (orange bg, white text)
- Nav items: `[Services & Pricing]` `[About]` — no Contact

### Body Classes
- Public pages: `<body class="dark-page">` (matches `:root` dark defaults)
- Dashboard pages: `<body class="light-page">` (overrides to light palette)

### User Menu Dropdown (`.user-menu`)
Used on all public pages. Inline JS: `toggleUserMenu()`, `showToast()`, click-outside handler.
Structure: `.user-menu` > button `onclick="toggleUserMenu()"` > `.user-menu-dropdown` with `.user-menu-option` role cards + `.user-menu-action` buttons at bottom.

### Lucide Icons
- Dashboard sidebar: `<i data-lucide="name" class="sidebar-icon">` — 15×15px, `stroke: currentColor`
- Active state inherits `color: var(--brand)` via `.sidebar-link.active .sidebar-icon`
- Always call `lucide.createIcons()` inside `DOMContentLoaded`
