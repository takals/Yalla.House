---
name: audit-buttons
description: Audit all interactive elements across one or all Yalla.House pages and report any unhandled buttons.
---

# Button Audit

Audit every `<button>` and `<a>` element across the Yalla.House pages to confirm all interactive elements are wired.

## What to audit
$FILE_OR_ALL

## Steps
1. Read each target HTML file
2. Extract every `<button>` and `<a href>` element
3. For each element, check:
   - Has an `onclick` attribute → PASS
   - Its text (trimmed, whitespace-normalised) matches a `txt === '...'` branch in the delegation handler → PASS
   - Navigates to a real URL/anchor → PASS
   - Otherwise → FAIL (unhandled)
4. Also check for `href="#"` links — flag as WARN
5. Output a table: Element | Text | Page | Status

Report total counts: X elements · Y unhandled · Z warnings.
