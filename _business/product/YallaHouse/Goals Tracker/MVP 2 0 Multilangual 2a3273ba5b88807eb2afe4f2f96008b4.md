# MVP 2.0 Multilangual

Status: Not started

# Detail

Write a clear, specific description of what you want to achieve

  **Scale** path for multilingual Yalla.House across UK/DE/US/FR.

# **MVP (fast + simple, Framer-native)**

- **URL strategy:** subfolders per locale
    - yalla.house/en-uk/ (default), yalla.house/de/, yalla.house/fr-fr/, yalla.house/en-us/
- **Pages:** duplicate public pages per locale (Home, Services, About).
    - Keep the **property page UI** shared; only **copy** and **labels** change.
- **Language switcher:** small dropdown in header; remember choice in a cookie.
- **CMS fields:** add locale to collections and filter per page.
    - For **Properties**, keep a single record, but add **localized fields** for text bits:
        
        title_en, title_de, desc_en, desc_de, etc. (images/EPC/floorplan are shared).
        
- **Basic SEO:** add hreflang for each locale version; set canonical to the localized URL.
- **Currency & formats:** show **local currency symbol + localized number/date** (static mapping per locale at first).
    - UK: £650,000 • DE: 650.000 £ or 650.000 £ (you may prefer € when relevant) • FR: 650 000 £
    - Dates: 08 Nov 2025 vs 08.11.2025.
- **Forms & emails:** duplicate per locale (Framer Forms → different success copy).
- **WhatsApp templates:** store per language: whatsapp_template_en, _de, _fr.

# **Phase 2 (proper i18n, still light)**

- **String dictionary:** move all UI copy into a single **“Strings” CMS** keyed set:
    - key: "book_viewing_cta", en: "Book a viewing", de: "Besichtigung buchen", fr: "Réserver une visite", etc.
    - Components read Strings[key][currentLocale].
- **Properties localization:** switch to **per-locale child records** when you need different headlines or compliance lines:
    - properties (master) → property_translations (locale, title, description, legal_disclaimer).
- **Pricing per market:** allow **market-specific price cards** in CMS:
    - market: uk/de/us/fr, currency, amount, features[].
- **Routing guard:** auto-redirect users by **browser language** on first visit; always show manual selector.

# **Phase 3 (scale + workflows)**

- **Translation workflow:** connect a TMS (Lokalise/Phrase/POEditor).
    - Export “Strings” and long-form content; invite translators; sync back to Framer CMS via CSV or API.
- **Dynamic currency:** plug a rates API (or nightly cron) and store converted prices; format with locale rules.
- **Legal & compliance per region:**
    - Cookie banner text, privacy, terms, **EPC wording (UK)** vs **Energieausweis (DE)**, **lead-based paint (US)**, etc.
    - Store per-locale legal snippets in CMS (legal_footer_[locale]).
- **Numbers, dates, phones:** standardize to **E.164** internally; display via locale format.
    - Validate postcodes per country (UK/DE/US/FR).
    - Time zones: property’s local time for calendars.
- **Hreflang matrix:** generate full cross-links between all locale equivalents of each page.
- **WhatsApp/Email templates:** maintain **locale-specific** notification templates; auto-pick by user/browser locale.

# **Buyer/Seller dashboards (private areas)**

- **One codebase, multi-locale UI:** wrap all labels in t("key") calls resolved from the **Strings** CMS.
- **User preference:** store preferred_locale on account; default from browser on first login.
- **Documents:** keep uploads as-is; label/section names localized.
- **Offer & signature flows:** localize steps and legal text; per-market disclaimers pulled from CMS.

# **Practical field plan (concise)**

**Strings (CMS)**

- key (unique), en, de, fr, enUS
- Example: book_cta → “Book a viewing” | “Besichtigung buchen” | “Réserver une visite”

**Properties (CMS)**

- Shared: images, EPC file, floorplan, price_base, address, slug
- Localized: title_en, title_de, desc_en, desc_de, disclaimer_en, disclaimer_de

**Pricing (CMS)**

- market (uk/de/us/fr), plan_id, name_[locale], price, currency, features_[locale][]

**Org/Legal (CMS)**

- privacy_[locale], terms_[locale], cookie_banner_[locale], support_copy_[locale]

# **URL conventions (recommended)**

- Marketing: /en-uk/services, /de/services, /fr-fr/services
- Properties: keep **one public path** and switch copy by locale param or cookie:
    - /p/king-street-ilford?lang=de (then persist).
    - If SEO is important for property descriptions in local languages, generate localized mirrors: /de/p/king-street-ilford with hreflang.

# **Rollout checklist**

- Decide default locale (en-UK).
- Add language switcher + cookie remember.
- Duplicate public pages into /en-uk, /de, /fr-fr.
- Add Strings CMS and replace hardcoded labels.
- Localize top CTAs (headers, forms, WhatsApp templates).
- Hreflang + canonical tags per page.
- Pricing cards per market.
- Legal docs per locale.
- QA: dates, currencies, postcodes, phone masks, calendar timezones.

If you want, I can produce a **ready-to-paste “Strings” sheet (CSV)** with all the key labels for EN/DE/FR to jump-start your translation set.

# Success Metrics

Define how you will measure progress and success

# Timeline

Set deadlines and milestones

# Action Plan

- [ ]  
- [ ]  
- [ ]  

# Related files

[https://www.notion.so](https://www.notion.so)