---
paths:
  - "Website/dashboards/**"
---

# Dashboard Rules

## Dashboard Shell Layout
```
.app-root (flex, 100vh)
  ├── .sidebar (240px, flex-col, overflow-y:auto)
  └── .app-main (flex-1, flex-col)
       ├── .app-topbar (60px, fixed height)
       └── .app-content (flex-1, flex)
            ├── .app-canvas (flex-1, overflow-y:auto, padding 1.625rem 1.5rem)
            └── .app-rail (264px — Owner dashboard only)
```

## Shared Pattern
- Each dashboard has a `showView(viewId, triggerEl)` function and a `showToast()` function
- `dashboard.html` loads these from `app.js`; all others define them inline
- Navigation: sidebar `.sidebar-link` elements call `showView()` on click
- Section panels: `.section-card > .section-card-header > .section-card-title`

---

## dashboard.html — Owner / Seller
- **Sole dashboard that loads `app.js`** (`src="../app.js"`)
- Views: `dashboard`, `listings`, `inquiries`, `analytics`, `documents`, `calendar`, `settings`
- Right rail (`.app-rail`) visible only on `dashboard` and `calendar` views
- Hash navigation: `#dashboard`, `#listings`, etc.
- `initDashboardInteractions()` in app.js handles all button event delegation

## buyer.html — Home Hunter
- Inline `<script>` only (no app.js)
- Views: `dashboard`, `search`, `saved`, `offers`, `surveys`, `inbox`, `booking`, `settings`
- Inbox uses `.msg-thread` with `.msg-bubble.inbound` / `.msg-bubble.outbound`
- Button whitespace normalised: `.replace(/\s+/g, ' ')` after `.trim()` (multiline button text fix)

## admin.html — Yalla Admin
- Inline `<script>` only
- Views: `dashboard`, `activity`, `owners`, `hunters`, `tasks`, `surveys`, `support`, `billing`, `integrations`, `sysSettings`
- Sidebar logo shows `<span>ADMIN</span>` badge

## agent.html — Field Agent
- Inline `<script>` only
- Views: `dashboard`, `schedule`, `jobs`, `properties`, `reports`, `inbox`, `settings`
- Job type badges: `badge-photo` (blue), `badge-board` (green), `badge-viewing` (orange), `badge-survey` (purple)

---

## Adding New Dashboard Views
1. Add a new `<div id="viewId" class="view">` inside `.app-canvas`
2. Add a `.sidebar-link` that calls `showView('viewId', this)`
3. Wire all buttons in that view via inline `onclick` or add a `txt === 'Button Text'` branch to the delegation handler
