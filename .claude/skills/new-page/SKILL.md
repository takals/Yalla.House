---
name: new-page
description: Scaffold a new public HTML page for Yalla.House following all project conventions.
variables:
  - name: PAGE_NAME
    description: Slug for the new page, e.g. "contact" or "faq"
  - name: PAGE_TITLE
    description: Human-readable page title, e.g. "Contact Us" or "FAQ"
---

# New Public Page: $PAGE_TITLE

Scaffold `Website/$PAGE_NAME.html` following all Yalla.House conventions.

## Requirements
1. Use the same `<head>` boilerplate as `index.html` (fonts, Lucide CDN, `../style.css` → `style.css`)
2. Include the `.site-header` with:
   - Logo linking to `index.html`
   - Nav: `[Services & Pricing]` `[About]` — **no Contact**
   - `.user-menu` dropdown (identical to index.html)
   - "List Your Place" `.btn-primary` linking to `list.html`
3. Include the standard 4-column footer (Brand, Policies, Legal & Compliance, Contact)
4. Use `.section > .section-inner` for all content sections
5. Add inline `<script>` at bottom with `toggleUserMenu()`, `showToast()`, and click-outside handler
6. Wire all buttons before returning

## Read first
- `Website/index.html` — use as the structural template
- `Website/style.css :root` — use only these tokens for all colours, spacing, radii

## Output
Create the file and confirm: file path · section count · interactive elements wired.
