# MVP 0.2 small habits

Status: Not started

# Detail

Perfect ✅ — here’s your **Yalla.House – MVP Localization Prep Checklist (Markdown)**

---

# **🌍 Yalla.House — MVP Localization Prep Checklist**

**Goal:**

Keep the MVP English-only but structure everything so future localization (Germany, France, US) is smooth and low-cost.

---

## **🧱 1. Base Language Setup**

- Default site language set to **en-GB**
- Add <html lang="en-GB"> to all pages
- Include <meta name="og:locale" content="en_GB">
- Document “English (UK)” as base content language in roadmap

---

## **🧩 2. Copy & Text Organization**

- Keep all user-facing text (headings, CTAs, tooltips) in CMS fields or JSON variables — **no hardcoded text** in components
- Group strings logically (Hero, Buttons, Forms, Footer)
- Optional: maintain a simple “Strings” sheet for internal tracking

---

## **🗂️ 3. URL & Routing**

- Use **neutral URLs** (no locale prefix yet)
    
    Example: /services ✅ not /en/services
    
- Plan to add locale subfolders later: /de/services, /fr/services
- Avoid hardcoding URLs in copy — reference variables instead

---

## **🧮 4. Data Formatting**

- Store prices as numeric values (price: 650000)
- Store dates as ISO format (2025-11-06)
- Display currency and date formats via template later
- Keep measurements (sq ft/m²) in separate fields

---

## **🎨 5. Design Flexibility**

- Leave ~25% width buffer in buttons & headings for longer translations
- Avoid embedding text in images or icons
- Use consistent typography sizes to prevent layout breaks
- Test responsive layouts with mock German/French strings (optional)

---

## **⚙️ 6. Language Switcher Placeholder**

- Add 🌐 icon in the header (non-functional for now)
- Prepare dropdown structure: EN / DE / FR / US
- Store user language preference in cookies (optional placeholder logic)

---

## **⚖️ 7. Legal & Regulatory**

- Store **Terms, Privacy, Cookie Policy** in CMS with locale field
- Prepare placeholders for future localized versions
- Keep disclaimers (EPC / energy) separate so they can differ by market

---

## **📊 8. SEO Readiness**

- Add <link rel="alternate" hreflang="en-GB" href="https://yalla.house/" />
- Set canonical URLs per page
- Use structured data (Organization, WebSite) with @language: "en"
- Page titles & meta descriptions stored in CMS or meta settings

---

## **💬 9. Communication & Support**

- WhatsApp and email templates in English only for now
- Store them in a structured way (later can add _de, _fr variants)
- Keep “support copy” centralised for quick translation later

---

## **🧠 10. Internal Documentation**

- Create a “Localization Ready” note in Notion → MVP Roadmap
- Record:
    - Default language
    - How strings are stored
    - Where to plug translations later
    - Planned future locales (EN, DE, FR, US)

---

### **✅ Summary**

MVP stays **English-only**, but:

- Text is cleanly structured
- URLs are neutral
- All formats (dates, prices) are locale-safe
- Legal copy is modular
- Design can handle longer text

Once these boxes are ticked, you’re **100% localization-ready**.

---

Would you like me to turn this into a downloadable **Markdown (.md)** file so you can import it directly into Notion as a task list?

# Success Metrics

Define how you will measure progress and success

# Timeline

Set deadlines and milestones

# Action Plan

- [ ]  

# 🌍 Yalla.House — MVP Localization Prep Checklist

**Goal:**

Keep the MVP English-only but structure everything so future localization (Germany, France, US) is smooth and low-cost.

---

## 🧱 1. Base Language Setup

- [ ]  Default site language set to **en-GB**
- [ ]  Add `<html lang="en-GB">` to all pages
- [ ]  Include `<meta name="og:locale" content="en_GB">`
- [ ]  Document “English (UK)” as base content language in roadmap

## 🧩 2. Copy & Text Organization

- [ ]  Keep all user-facing text (headings, CTAs, tooltips) in CMS fields or JSON variables — **no hardcoded text** in components
- [ ]  Group strings logically (Hero, Buttons, Forms, Footer)
- [ ]  Optional: maintain a simple “Strings” sheet for internal tracking

## 🗂️ 3. URL & Routing

- [ ]  Use **neutral URLs** (no locale prefix yet)
- [ ]  Plan to add locale subfolders later: `/de/services`, `/fr/services`
- [ ]  Avoid hardcoding URLs in copy — reference variables instead

## 🧮 4. Data Formatting

- [ ]  Store prices as numeric values (`price: 650000`)
- [ ]  Store dates as ISO format (`2025-11-06`)
- [ ]  Display currency and date formats via template later
- [ ]  Keep measurements (sq ft/m²) in separate fields

## 🎨 5. Design Flexibility

- [ ]  Leave ~25% width buffer in buttons & headings for longer translations
- [ ]  Avoid embedding text in images or icons
- [ ]  Use consistent typography sizes to prevent layout breaks
- [ ]  Test responsive layouts with mock German/French strings (optional)

## ⚙️ 6. Language Switcher Placeholder

- [ ]  Add 🌐 icon in the header (non-functional for now)
- [ ]  Prepare dropdown structure: EN / DE / FR / US
- [ ]  Store user language preference in cookies (optional placeholder logic)

## ⚖️ 7. Legal & Regulatory

- [ ]  Store **Terms, Privacy, Cookie Policy** in CMS with `locale` field
- [ ]  Prepare placeholders for future localized versions
- [ ]  Keep disclaimers (EPC / energy) separate so they can differ by market

## 📊 8. SEO Readiness

- [ ]  Add `<link rel="alternate" hreflang="en-GB" href="<https://yalla.house/>" />`
- [ ]  Set canonical URLs per page
- [ ]  Use structured data (`Organization`, `WebSite`) with `@language: "en"`
- [ ]  Page titles & meta descriptions stored in CMS or meta settings

## 💬 9. Communication & Support

- [ ]  WhatsApp and email templates in English only for now
- [ ]  Store them in a structured way (later can add `_de`, `_fr` variants)
- [ ]  Keep “support copy” centralised for quick translation later

## 🧠 10. Internal Documentation

- [ ]  Create a “Localization Ready” note in Notion → MVP Roadmap
- [ ]  Record:
    - Default language
    - How strings are stored
    - Where to plug translations later
    - Planned future locales (EN, DE, FR, US)

---

### ✅ Summary

MVP stays **English-only**, but:

- Text is cleanly structured
- URLs are neutral
- All formats (dates, prices) are locale-safe
- Legal copy is modular
- Design can handle longer text

Once these boxes are ticked, you’re **100% localization-ready**.

- [ ]  
- [ ]  

# Related files

[https://www.notion.so](https://www.notion.so)