# Code Style Rules

## Formatting
- 2-space indentation in HTML and CSS
- Quote all HTML attribute values with double quotes
- BEM-inspired CSS class names: `.block`, `.block-element`, `.block--modifier`
- ES5-compatible JS in inline scripts — avoid arrow functions; use `var`, not `let`/`const` in inline `<script>` blocks

## CSS Rules
- Use CSS custom properties (tokens) for **all** colours, spacing, and radii — never hardcode hex values outside `:root`
- Add `will-change: transform` on elements that use `:hover` transforms
- Never use `!important` — fix specificity instead
- Don't load external fonts or icon libraries beyond Plus Jakarta Sans + Lucide v0.475.0

## JS Rules
- Don't create new JS files — add shared logic to `app.js` or to the page's inline `<script>`
- All interactive buttons must be wired to `showToast()` or `showView()` — never leave a handler empty
- When matching button text in event delegation, normalise whitespace: `btn.textContent.trim().replace(/\s+/g, ' ')`
- Don't use `href="#"` — use a real href or `onclick="showToast(...)"` for demo actions

## DO
- Use `lucide.createIcons()` inside `DOMContentLoaded` on every page that uses Lucide icons
- Keep page-specific styles in an inline `<style>` block inside `<head>`
- Use `.section > .section-inner` pattern for all public page content sections
- Use `.section-card > .section-card-header > .section-card-title` for dashboard panels
- Wire all new buttons before committing

## DON'T
- Don't use framework-specific syntax (no React, Vue, Angular, TypeScript)
- Don't add a `Contact` link to the public header nav — it belongs in the footer only
- Don't use emoji as UI controls — emoji is decorative only (service cards, content blocks)

## Button Interaction Pattern
All 199 interactive elements across the 8 pages are wired via two mechanisms:
1. **Inline `onclick`** attributes — handled directly on the element
2. **Event delegation** — `document.addEventListener('click')` with `txt === 'Button Text'` matching

- `dashboard.html`: delegation lives in `app.js → initDashboardInteractions()`
- All other dashboards + list.html: delegation lives in the page's inline `<script>` block

When adding a new button, either add an `onclick` attribute or add a `txt === 'Button Text'` branch to the page's delegation handler.
