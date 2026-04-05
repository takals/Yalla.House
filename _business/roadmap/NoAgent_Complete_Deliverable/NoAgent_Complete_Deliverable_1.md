# NoAgent — Complete End-State Deliverable

## Executive Summary & Assumptions

NoAgent is a global, agent-free property transaction operating system enabling owners to sell or rent property end-to-end through a guided digital workflow. This document is the complete execution blueprint: product spec, architecture, security, testing, documentation, go-to-market, and execution plan.

**Key Assumptions Made:**

- Initial launch market is the United Kingdom; jurisdiction-plugin architecture supports expansion to EU, US, AUS, and other markets.
- NoAgent does not hold client money. All escrow, deposit protection, and payment flows route through FCA-regulated (or local equivalent) partners.
- NoAgent does not provide legal advice. Legal workflows connect users to regulated solicitors/conveyancers.
- Identity verification is outsourced to a KYC/KYB provider (e.g., Onfido, Jumio, or Sumsub).
- The platform launches as a web application (Next.js); native mobile apps are Phase 2.
- "Jurisdiction plugin" means a configuration layer (rules, templates, required fields, partner integrations) that can be swapped per country/region without core code changes.

---

# PART 1 — FULL PRODUCT SPECIFICATION

---

## 1.1 Roles & RBAC Matrix

### Role Definitions

| Role ID | Role Name | Description |
|---------|-----------|-------------|
| R01 | Seller | Individual listing a property for sale |
| R02 | Landlord | Individual listing a single property for rent |
| R03 | Portfolio Landlord | Manages multiple rental units; sees aggregate dashboard |
| R04 | Buyer | Searching for and purchasing property |
| R05 | Tenant / Applicant | Searching for and applying to rent property |
| R06 | Delegate | Co-owner, family member, or assistant with shared access granted by R01–R03 |
| R07 | Service Provider | Photographer, floorplan creator, EPC assessor, solicitor, mortgage broker, inventory clerk, cleaner, removals firm |
| R08 | Verifier | Third-party identity/ownership verification partner |
| R09 | NoAgent Support | Customer success staff |
| R10 | NoAgent Trust & Safety | Moderation, anti-fraud, compliance |
| R11 | NoAgent Admin | Super-admin: config, disputes, billing overrides, partner management |

### Permission Matrix (Key Actions)

| Action | R01 | R02/R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 |
|--------|-----|---------|-----|-----|-----|-----|-----|-----|-----|-----|
| Create listing (sale) | W | — | — | — | D | — | — | — | — | W |
| Create listing (rental) | — | W | — | — | D | — | — | — | — | W |
| Edit own listing | W | W | — | — | D | — | — | — | — | W |
| View public listing | R | R | R | R | R | R | R | R | R | R |
| Send enquiry | — | — | W | W | — | — | — | — | — | — |
| View enquiries on own listing | R | R | — | — | D | — | — | R | R | R |
| Respond to enquiry | W | W | — | — | D | — | — | — | — | — |
| Schedule viewing | W | W | W | W | D | — | — | — | — | — |
| Submit offer | — | — | W | — | — | — | — | — | — | — |
| Submit rental application | — | — | — | W | — | — | — | — | — | — |
| View offers on own listing | R | R | — | — | D | — | — | R | R | R |
| Accept/reject offer | W | W | — | — | D | — | — | — | — | W |
| Access Deal Room | W | W | W | W | D | Inv | — | R | R | R |
| Upload documents (Deal Room) | W | W | W | W | D | Inv | — | — | — | — |
| Invite stakeholder to Deal Room | W | W | — | — | D | — | — | — | — | W |
| Book service provider | W | W | — | — | D | — | — | — | — | — |
| Accept/deliver service job | — | — | — | — | — | W | — | — | — | — |
| Verify identity/ownership | — | — | — | — | — | — | W | — | — | — |
| Moderate listings | — | — | — | — | — | — | — | — | W | W |
| Resolve disputes | — | — | — | — | — | — | — | — | W | W |
| Configure platform settings | — | — | — | — | — | — | — | — | — | W |
| View audit logs | — | — | — | — | — | — | — | R | R | R |
| Manage billing/subscriptions | W | W | — | — | — | W | — | — | — | W |

**Legend:** W = Write/Full, R = Read, D = Delegated (mirrors owner's perms), Inv = Invited (per-document access), — = No access.

**Core Permission Principles:**

- Least privilege enforced at API middleware level; every endpoint declares required role + resource ownership check.
- Deal Room permissions are granular per-document (seller, buyer, their solicitors, broker).
- Every sensitive action (view PII, download document, edit listing price, accept offer, ban user) is logged to an immutable audit table.
- Delegates inherit a scoped subset of the delegator's permissions; delegator can revoke at any time.

---

## 1.2 Detailed User Journeys

### 1.2.1 Seller Journey (Sale)

**Phase 1 — Onboarding & Listing Creation**

1. Seller signs up via email or phone; verifies with OTP.
2. Optionally completes ID verification (KYC partner) to earn "ID Verified" badge.
3. Enters property address — system validates against address API (e.g., OS Data Hub UK, Google Places).
4. Fills structured property form: type (flat, house, bungalow, land), tenure (freehold, leasehold, share of freehold), bedrooms, bathrooms, reception rooms, sq ft/m², condition, key features (garden, parking, listed building, etc.), EPC rating (if known).
5. Completes seller disclosures: flood risk awareness, boundary disputes, planning applications, service charges (leasehold), ground rent, lease length remaining, restrictive covenants.
6. Compliance content filter scans description for discriminatory language (regex + ML classifier). Blocks publish if flagged; seller can appeal.
7. Uploads photos/videos. System auto-resizes to standard breakpoints (400w, 800w, 1200w, 1600w), strips EXIF metadata, optionally watermarks. Minimum 5 photos to publish.
8. Optionally orders professional photography / floorplan / EPC via service marketplace (inline during listing flow).
9. Pricing module: system shows comparable sold prices (Land Registry / equivalent data), active listing comparisons, local demand indicators (searches in area, saved alerts). Seller chooses strategy: Maximize price | Sell fast | Date-driven. System generates recommended list price + "pricing confidence" score.
10. Seller reviews full preview.
11. Chooses verification level: Unverified (free), ID Verified (via KYC), Ownership Verified (upload title deed + partner check), Enhanced Verified (all + additional checks).
12. Chooses distribution: NoAgent marketplace (default), social share kit, optional syndication to portal partners (where available — e.g., Rightmove/Zoopla data feed in UK), optional paid boost.
13. Clicks Publish. Listing goes live (or enters moderation queue if risk-scored above threshold).

**Phase 2 — Enquiries & Lead Management**

14. Enquiries arrive in unified inbox per listing. Each enquiry includes buyer's message, profile (verified status, chain status, finance status if shared), and timestamp.
15. Spam filter + rate limiter (max 10 enquiries per buyer per day across platform). Masked email/phone — all comms route through NoAgent relay.
16. Auto-response sent to buyer confirming receipt; includes seller's pre-qualification questions (configurable): "What is your buying timeline?", "Are you chain-free?", "Do you have a mortgage agreement in principle?"
17. Seller sees lead quality indicators per buyer: verified badge, AIP uploaded, responsiveness score, chain-free tag.
18. Seller responds via in-platform messaging. System nudges seller if >24 hours no response.

**Phase 3 — Viewing Scheduling**

19. Seller configures availability rules: open-house time blocks OR private viewing slots. Sets buffer time between viewings (default 15 min), max attendees per slot, whether buyer verification is required to book.
20. Buyer books viewing from listing page. Automated confirmation sent to both parties (email + SMS).
21. 24 hours before: automated reminder sent. Buyer must tap "Confirm attendance" link. If no confirmation, seller is notified; slot optionally re-opened.
22. Post-viewing: buyer receives feedback prompt ("Rate your interest: 1–5, would you like to make an offer?"). Seller receives buyer feedback. Seller can add private notes.
23. No-show tracking: if buyer no-shows without cancellation, pattern logged. After 3 no-shows, buyer's booking ability is restricted (must verify ID or pay refundable deposit per booking).

**Phase 4 — Offers & Negotiation**

24. Buyer submits structured offer: amount, conditions (subject to survey, subject to mortgage, chain details), proof of funds (upload), offer expiry date.
25. Seller sees offer comparison table. System computes "offer strength score" based on: amount vs. asking price, chain status, finance proof, buyer verification level, conditions count.
26. Seller can: accept, reject (with optional reason), counter-offer (new amount/conditions). Best-and-final round mechanism: seller can trigger "best and final" deadline — all active buyers notified.
27. All negotiation messages thread under the specific offer. Immutable once submitted; amendments create new versions.
28. Offer acceptance triggers: (a) creation of Deal Room, (b) "Sold Subject to Contract" status on listing, (c) notification to other buyers that an offer has been accepted.

**Phase 5 — Deal Room**

29. Deal Room is a transaction workspace. Milestone checklist auto-populated based on jurisdiction + property type (e.g., UK freehold sale: Memorandum of Sale → Solicitors instructed → Searches ordered → Survey arranged → Mortgage offer → Contract pack exchanged → Exchange of contracts → Completion).
30. Document vault: both parties (and their solicitors) upload documents. Versioning on all files. Per-document access control (seller, buyer, seller solicitor, buyer solicitor, broker).
31. Seller invites solicitor (enter email or choose from marketplace). Buyer does the same. Broker invited optionally.
32. Secure messaging within Deal Room. All messages logged (audit trail).
33. Status dashboard shows current milestone, next required action, who is blocking, days since last update.
34. Automated nudges: if a milestone is stalled >X days (configurable per jurisdiction), nudge emails sent to blocking party + summary to other party.
35. E-signature integration (via partner, e.g., DocuSign/Adobe Sign) where jurisdiction supports it.

**Phase 6 — Legal Handoff & Completion**

36. Seller can: use their existing solicitor (provide details, solicitor receives access link), choose from NoAgent's solicitor marketplace, or use DIY conveyancing templates (where legally permitted — e.g., Scotland has specific requirements).
37. Data handoff: all listing data, buyer data, offer terms, documents auto-shared to solicitor workspace. Reduces re-keying.
38. Payments/escrow handled by regulated partner. NoAgent never touches client money.
39. Completion confirmed in platform. Both parties receive confirmation. Reviews prompted (buyer reviews seller, seller reviews buyer). Listing marked "Sold."
40. Post-sale upsells: "Rent out your old property?", "Refer a friend to sell", service provider recommendations (removals, cleaning).

### 1.2.2 Landlord Journey (Rental)

**Phase 1 — Listing**

1. Steps 1–13 from seller journey, with rental-specific fields: monthly rent, deposit amount (capped per jurisdiction — e.g., 5 weeks in England), minimum tenancy term, furnished status (furnished/part/unfurnished), bills included (list), pets policy, available from date.
2. Eligibility statement (compliant phrasing per Equality Act 2010 / local equivalent).
3. Right-to-rent requirement flag (England-specific; jurisdiction plugin toggles).

**Phase 2 — Enquiries & Viewings**

4. Same as seller phases 2–3.

**Phase 3 — Applications**

5. Interested tenant submits application: personal details, employment status, annual income, current address, references (current landlord, employer).
6. Landlord can require: (a) ID verification, (b) right-to-rent check (UK), (c) credit/landlord referencing (via partner, e.g., Canopy, OpenRent referencing, HomeLet).
7. Referencing partner returns structured report: credit score band, landlord reference outcome, employer reference outcome, right-to-rent status, affordability check (rent ≤ X% of income).
8. Landlord sees application comparison dashboard. Can accept, reject (must log reason — kept private but audited for fair housing compliance), or waitlist.
9. Rejection reasons are structured (affordability, references, tenant withdrew, property let to another applicant) — protects against discrimination claims.

**Phase 4 — Tenancy Creation**

10. On acceptance, system generates tenancy agreement from jurisdiction-specific template (e.g., AST for England/Wales, PRT for Scotland, different forms for other jurisdictions).
11. Both parties e-sign.
12. Deposit collected via payment partner. Deposit protection scheme registration handled by partner (UK: DPS, MyDeposits, or TDS — landlord selects or system auto-routes).
13. Prescribed information issued to tenant (legally required within 30 days in England).
14. Inventory / check-in: landlord can book via service marketplace. Report stored in platform.
15. Tenant receives "move-in pack": property details, emergency contacts, how to report maintenance (if landlord opts into maintenance extension).

### 1.2.3 Buyer Journey

1. Browses marketplace: search by location (map + text), price range, property type, bedrooms, filters (garden, parking, chain-free, new build, etc.).
2. Sees trust signals on each listing: verification badge level, "responsive seller" indicator, "verified media" tag, days on market.
3. Saves listings, sets alerts (new listings matching criteria).
4. Clicks "Enquire" — submits guided enquiry (timeline, finance, chain status, message).
5. Optionally upgrades to "Verified Buyer": completes ID verification + uploads AIP/proof of funds. Badge visible to sellers — increases offer acceptance probability.
6. Books viewing via calendar widget. Receives confirmation + reminders.
7. Post-viewing: submits structured offer or moves on.
8. If offer accepted: gains Deal Room access. Uploads survey report, mortgage offer, solicitor details. Tracks milestones to completion.

### 1.2.4 Tenant Journey

1. Same search/browse as buyer, with rental filters (max rent, available from, pets allowed, furnished, bills included).
2. Enquires / books viewing.
3. Submits application (structured form). Completes referencing if required.
4. If accepted: reviews tenancy agreement, e-signs, pays deposit + first month via payment partner.
5. Receives move-in pack and inventory check-in booking.

### 1.2.5 Service Provider Journey

1. Provider signs up. Completes business profile: company name, registration number, service type(s), service areas (postcodes/regions), pricing (fixed packages or quote-based), availability calendar, portfolio/samples.
2. Identity + business verification (Companies House check for UK; equivalent elsewhere).
3. Provider listed in marketplace. Visible to sellers/landlords during listing creation and from dedicated marketplace page.
4. Receives job request (booking or quote request). Accepts/declines within SLA window (default 4 hours).
5. Delivers assets: photos/floorplans uploaded directly into seller's listing media gallery. Reports (EPC, inventory) uploaded to relevant document store.
6. Marks job complete. Seller confirms satisfaction or raises dispute.
7. Payout processed per billing cycle (weekly/fortnightly, configurable). NoAgent deducts platform fee (take-rate).
8. Accumulates reviews + performance metrics (on-time %, dispute rate, average rating).

### 1.2.6 Admin Journey

1. Accesses admin console (separate web app, authenticated with MFA-required admin credentials).
2. Dashboards: platform KPIs, moderation queue depth, active disputes, provider performance, revenue.
3. Actions: approve/reject flagged listings, suspend/ban users, resolve disputes (refund, partial credit, warning), configure jurisdiction settings, manage partner integrations, adjust pricing/packages, view audit logs, export compliance reports.

### 1.2.7 Trust & Safety Journey

1. Reviews moderation queue: risk-flagged listings, user reports, spam alerts.
2. Uses investigation tools: view user history, listing history, IP/device patterns, cross-reference with known fraud patterns.
3. Actions: verify (approve listing), warn user, suspend listing, ban user (with reason code), escalate to legal.
4. Appeals management: user submits appeal → T&S reviews → uphold/overturn → notification.

---

## 1.3 Feature List by Module

### Module: Listings

- Structured property data capture (sale + rental schemas)
- Address validation + geocoding
- Media management (upload, resize, EXIF strip, watermark, reorder, delete)
- Floorplan upload/order
- Pricing engine (comparables, demand signals, strategy selector, confidence score)
- Verification badge system (4 tiers)
- Compliance content scanner
- Publish workflow (preview → publish → moderation if flagged)
- Listing status machine: Draft → Active → Under Offer/Let Agreed → Sold/Let → Withdrawn → Expired
- Edit history with versioning
- Syndication adapter (portal data feeds)
- Social share kit generator (OG images, pre-written copy)
- Paid boost (integration with ad platforms)

### Module: Pricing Engine

- Comparable sales data feed (Land Registry API / equivalent)
- Active listing data aggregation
- Local demand signals (search volume, alert count, enquiry rate in area)
- Strategy engine: Maximize / Fast / Date-driven → adjusts recommended price
- Confidence score (0–100) based on comparable coverage and market activity
- Price change suggestions (if listing stale after X days)

### Module: Inbox & Messaging

- Unified inbox per listing (enquiries, viewing messages, offer discussion)
- Global inbox per user (across all listings)
- Masked contact relay (email + SMS proxy)
- Spam detection (ML classifier + heuristic rules)
- Rate limiting (per-user, per-listing, per-day)
- Auto-responses (configurable per listing)
- Pre-qualification question templates
- Read receipts + response time tracking
- Block/report functionality
- Safe messaging: no external links in first 3 messages, link preview scanning

### Module: Viewing Scheduler

- Availability rule builder (recurring slots, one-off blocks, open house events)
- Calendar sync (iCal export)
- Instant booking (if seller enables) or request-based
- Automated confirmations (email + SMS)
- 24-hour reminders with "confirm attendance" CTA
- No-show tracking + escalation (restrict after 3 no-shows)
- Post-viewing feedback prompts (buyer) + notes (seller)
- Buffer time management
- Cancellation / reschedule flows
- Viewing analytics (per listing: booked, confirmed, attended, no-show)

### Module: Offers & Negotiation

- Structured offer form (amount, conditions, chain, finance proof, expiry)
- Offer strength scoring algorithm
- Offer comparison dashboard (seller view)
- Accept / reject / counter-offer actions
- Best-and-final round trigger
- Offer history (immutable log)
- Negotiation threading (messages linked to specific offer)
- Automatic status transitions (offer accepted → listing Under Offer → Deal Room created)
- Multi-offer management (seller can receive and compare multiple simultaneously)
- Offer withdrawal (buyer-initiated, logged)

### Module: Rental Applications

- Application form (personal details, employment, income, references, guarantor if applicable)
- Referencing partner integration (API-based)
- Right-to-rent check integration (UK-specific, jurisdiction plugin)
- Affordability calculator (configurable rent-to-income ratio)
- Application comparison dashboard (landlord view)
- Accept / reject / waitlist actions with structured reasons
- Automated communications (application received, referencing in progress, decision made)
- Fair housing compliance logging (all decisions + reasons audited)

### Module: Deal Room

- Auto-created on offer acceptance (sale) or application acceptance (rental)
- Milestone checklist engine (jurisdiction + property type templates)
- Document vault (upload, version, access control per document per stakeholder)
- Stakeholder management (invite/remove solicitors, brokers, etc.)
- Secure messaging (per-deal, audited)
- Status dashboard (current milestone, blocker identification, days elapsed)
- Automated nudges (configurable stall thresholds)
- E-signature integration (partner API)
- Completion/move-in confirmation workflow
- Post-completion actions (review prompts, referrals, upsells)

### Module: Service Marketplace

- Provider onboarding (profile, verification, service config, availability, pricing)
- Service catalog (categorised: Photography, Floorplan, EPC, Legal, Mortgage, Staging, Cleaning, Removals, Inventory, Referencing)
- Job booking flow (instant book or request quote)
- Scheduling + reminders
- Asset delivery (direct upload to listing media gallery)
- Payment processing (per-job or subscription)
- Reviews + ratings
- Provider performance dashboard (on-time %, dispute rate, cancellation rate, average rating)
- Dispute resolution (buyer/seller raises issue → T&S reviews → resolution)
- Bundles: "List Like a Pro" (photos + floorplan + listing copy), "Sell Fast Boost" (distribution + open house playbook), "Rent Ready" (photos + inventory + referencing + tenancy pack)

### Module: Billing & Payments

- Listing packages: Basic (free or minimal, limited features), Pro (full toolset, priority support), Premium (Pro + verification + boost credits)
- Verification upgrade pricing (per tier)
- Optional success fee (transparent, capped, jurisdiction-dependent, clearly disclosed)
- Landlord subscription (per property or portfolio pricing)
- Marketplace take-rate (percentage per completed job, configurable per service category)
- Provider subscription (priority placement, enhanced analytics)
- Payment processing via Stripe (cards, bank transfer, Apple Pay, Google Pay)
- Invoice generation + receipt
- Refund policy engine (cancellation windows, proration rules)
- Revenue recognition (deferred revenue for packages, recognized on completion for success fees)
- Subscription lifecycle (trial, active, past due, cancelled, expired)
- Tax handling (VAT where applicable, configurable per jurisdiction)

### Module: Reviews & Reputation

- Review types: Buyer→Seller, Seller→Buyer, Tenant→Landlord, Landlord→Tenant, User→Provider, Provider→User
- Structured ratings (1–5 stars + category sub-ratings)
- Free-text review with content moderation
- Review display rules (both parties must submit before either is revealed — prevents retaliation bias)
- Dispute mechanism (flag inappropriate review → T&S reviews → uphold/remove)
- Provider aggregate scores (average rating, review count, on-time %, dispute rate)
- "Responsive Seller" badge (auto-calculated from response time data)

### Module: Moderation & Trust

- Risk scoring engine (per listing, per user): IP reputation, device fingerprint, behavior patterns, listing anomaly detection (price outliers, repeated photos across different "properties," geo mismatches)
- Automated content filters (prohibited content, discriminatory language, scam patterns)
- Moderation queue (flagged items for human review)
- Takedown workflow (with reason codes + appeal process)
- User report system (harassment, scam, spam — structured categories)
- Account suspension / ban system (temporary, permanent, with reason logging)
- Safe messaging controls (link filtering, phone number masking)
- Verification tier enforcement (higher trust actions require higher verification)
- Anti-scraping measures (rate limits, bot detection, CAPTCHA on sensitive actions)
- Fraud pattern database (shared indicators across listings)

### Module: Analytics & KPIs

- Event taxonomy (see Section 6.3)
- Funnel dashboards: visit → listing started → published → first enquiry → first viewing → first offer → accepted → completed
- Cohort analysis (by area, property type, price band, listing package)
- Unit economics tracking (CAC, conversion rates, attach rate, LTV)
- Provider performance dashboards
- Moderation SLA tracking
- Revenue dashboards (by stream: packages, marketplace, subscriptions, boosts)

---

## 1.4 Edge Cases & Failure Handling

### No-Shows

- Buyer/tenant no-shows without cancellation: logged. After 3 strikes, booking restricted (must verify ID or pay refundable deposit).
- Seller no-shows: buyer can report. System logs. After 2 reports, seller receives warning. Pattern continues → listing deprioritised.

### Spam & Abuse

- Enquiry spam: rate limited (10/day/buyer across platform). Spam classifier flags suspicious patterns (bulk identical messages, external links, phone numbers in first message).
- Listing spam: duplicate detection (image hash comparison, address matching). Fake listing detection (anomaly scoring).
- Messaging abuse: block/report per conversation. Auto-detection of threatening language. Blocked user cannot see or contact reporter.

### Fraud Scenarios

- Fake owner: mitigated by ownership verification (title deed + partner check). Unverified listings display prominent warning.
- Advance fee fraud: system prohibits sellers from requesting direct payments through messaging. Payment only via regulated partner.
- Phantom listing: listing for property not owned/authorised. Cross-reference with available public records. Community reporting.
- Account takeover: MFA on sensitive actions (password change, email change, bank detail change). Session invalidation on credential change. Device trust scoring.

### Disputes

- Service provider disputes: buyer/seller raises issue → provider has 48h to respond → T&S mediates → resolution (refund, partial credit, or dismissed).
- Offer disputes: all offers are non-binding until exchange (UK). System clearly states this. Gazumping/gazundering communicated transparently via deal room status.
- Review disputes: user flags review → T&S reviews against content policy → uphold or remove.

### Stalled Deals

- Deal Room monitors milestone progress. If no milestone update in 14 days (configurable), automated nudge to blocking party.
- After 28 days stalled, escalation: both parties notified of risk. Seller can choose to re-list.
- After 56 days with no progress, deal auto-archived (not deleted). Listing can be reactivated.

### System Failures

- Media processing failure: job retried 3 times with exponential backoff. If still failing, user notified with manual upload option.
- Payment failure: retry logic (3 attempts over 24 hours). User notified. Listing/service remains active during grace period.
- Email/SMS delivery failure: fallback channel (if email fails, try SMS and vice versa). Failed notifications logged; user can see all notifications in-app.
- Search index lag: eventual consistency acceptable (target <30 seconds). Listing status changes reflected immediately in direct URL, search index catches up.

---

## 1.5 Jurisdiction Plugin Architecture

Each jurisdiction (country or region) is represented as a configuration object stored in the database and loaded at runtime. This avoids code branching and allows non-developer configuration of new markets.

**Plugin Configuration Schema:**

```
jurisdiction_config {
  jurisdiction_id: "GB-ENG"  // ISO 3166-2
  name: "England"
  currency: "GBP"
  locale: "en-GB"
  
  // Listing requirements
  required_fields: ["epc_rating", "council_tax_band", "tenure"]
  optional_fields: ["ground_rent", "service_charge"]
  
  // Legal requirements
  deposit_cap_weeks: 5  // Tenant Fees Act 2019
  right_to_rent_required: true
  deposit_protection_required: true
  deposit_protection_schemes: ["DPS", "MyDeposits", "TDS"]
  prescribed_info_deadline_days: 30
  
  // Tenancy templates
  tenancy_template_id: "ast_england_v3"
  
  // Sale milestones
  sale_milestone_template: "uk_freehold_sale"
  leasehold_sale_milestone_template: "uk_leasehold_sale"
  
  // Verification requirements
  ownership_verification_source: "land_registry_api"
  
  // Tax
  vat_rate: 0.20
  stamp_duty_applicable: true
  
  // Compliance
  fair_housing_law: "equality_act_2010"
  anti_money_laundering: true
  
  // Partners
  referencing_partners: ["canopy", "homelet"]
  legal_marketplace_enabled: true
  
  // Display
  area_unit: "sq_ft"
  date_format: "DD/MM/YYYY"
}
```

To launch in a new market, an admin creates a new `jurisdiction_config` record, uploads localised templates, configures partner integrations, and enables the jurisdiction. No code deployment required for configuration-only changes.

---

# PART 2 — TECHNICAL ARCHITECTURE

---

## 2.1 Recommended Stack & Justification

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS | SSR for SEO (listing pages), React Server Components for performance, App Router for modern patterns. |
| Backend API | Next.js API routes + server actions (Phase 1); extract to NestJS microservices if throughput demands (Phase 2) | Co-located with frontend reduces deployment complexity. NestJS path keeps option open for service decomposition. |
| Database | PostgreSQL 16 (managed: AWS RDS or Supabase) | ACID transactions for financial/legal data, JSONB for flexible jurisdiction configs, full-text search built-in, PostGIS for geo queries. |
| Cache | Redis (managed: AWS ElastiCache or Upstash) | Session store, rate limiting, job queue (via BullMQ), hot data caching. |
| Search | PostgreSQL full-text + PostGIS (Phase 1); Algolia or OpenSearch (Phase 2 at scale) | Avoid premature optimization. PG handles initial load. Upgrade path clear. |
| File Storage | AWS S3 + CloudFront CDN | Cost-effective, globally distributed, presigned URLs for secure uploads/downloads. |
| Auth | Clerk (or Auth0) | RBAC, MFA, social login, device management, webhook integrations. Battle-tested. |
| Email | Postmark (transactional) + SendGrid (marketing) | High deliverability, template management, analytics. |
| SMS | Twilio | Global coverage, programmable messaging, delivery receipts. |
| Payments | Stripe (Connect for marketplace payouts) | PCI-compliant, Connect handles multi-party payments, invoicing, subscriptions. |
| E-Signature | DocuSign or Adobe Sign (API) | Legally binding in target jurisdictions. |
| Identity Verification | Onfido (or Sumsub) | Document verification + biometric check. Global coverage. |
| Observability | Sentry (errors), Datadog or Grafana Cloud (metrics + logs + APM) | Full-stack observability. Sentry for error tracking with source maps. |
| CI/CD | GitHub Actions | Native to GitHub. Matrix builds, caching, deployment automation. |
| Infrastructure | Vercel (frontend + API routes) + AWS (RDS, S3, ElastiCache, worker processes) | Vercel for deployment simplicity and edge caching. AWS for data layer. |
| Media Processing | Sharp (image resize/convert) + FFmpeg (video) running in AWS Lambda or ECS task | Offload heavy processing from web servers. |

### Environment Separation

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| Development | Local dev + feature branches | Seeded test data, no PII | All developers |
| Staging | Pre-production testing, QA, demo | Anonymised copy of prod schema, synthetic data | Dev team + QA + product |
| Production | Live users | Real data, encrypted at rest + in transit | Restricted (deploy via CI/CD only, manual access requires MFA + audit log) |

**Secrets Management:** All secrets in environment variables via Vercel environment config (frontend/API) + AWS Secrets Manager (workers/infra). Never committed to repository. Rotated on schedule (90 days for API keys, 30 days for DB passwords).

**Database Migrations:** All schema changes via migration files (using Prisma Migrate or similar). Migrations reviewed in PR. Applied automatically in CI/CD pipeline. Rollback scripts for every migration.

---

## 2.2 Component Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Public Web   │  │   Web App    │  │   Admin Console      │   │
│  │  (Marketing   │  │  (Seller/    │  │  (Moderation/Config) │   │
│  │   + SEO)      │  │  Buyer/etc)  │  │                      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE / CDN (Vercel + CloudFront)             │
│  Static assets, ISR pages, image optimization, edge middleware   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js API Routes)               │
│                                                                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │ Auth    │ │ Listings  │ │ Messaging│ │ Offers    │           │
│  │ Module  │ │ Module    │ │ Module   │ │ Module    │           │
│  └─────────┘ └──────────┘ └──────────┘ └───────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Viewing  │ │ Deal Room│ │ Market-  │ │ Billing  │           │
│  │ Module   │ │ Module   │ │ place    │ │ Module   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Reviews  │ │ Moderat- │ │ Analytics│                         │
│  │ Module   │ │ ion Mod  │ │ Module   │                         │
│  └──────────┘ └──────────┘ └──────────┘                         │
│                                                                  │
│  Middleware: Auth check → RBAC check → Rate limit → Validation   │
└────────────────┬──────────────────────────┬─────────────────────┘
                 │                          │
        ┌────────▼────────┐        ┌────────▼────────┐
        │   PostgreSQL    │        │     Redis        │
        │  (Primary DB)   │        │  (Cache + Queue) │
        │  + PostGIS      │        │  + BullMQ        │
        └─────────────────┘        └────────┬─────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  Job Workers     │
                                   │  (ECS / Lambda)  │
                                   │                  │
                                   │  - Email sender  │
                                   │  - SMS sender    │
                                   │  - Media process │
                                   │  - Risk scoring  │
                                   │  - Reminder cron │
                                   │  - Search index  │
                                   │  - Analytics ETL │
                                   └────────┬─────────┘
                                            │
                 ┌──────────────────────────┼──────────────────┐
                 │                          │                  │
        ┌────────▼────────┐  ┌─────────────▼──┐  ┌───────────▼───────┐
        │   AWS S3        │  │ External APIs   │  │ Partner APIs      │
        │  (File Storage) │  │ - Onfido (KYC)  │  │ - Stripe          │
        │  + CloudFront   │  │ - Land Registry │  │ - DocuSign        │
        │                 │  │ - Address API   │  │ - Referencing      │
        └─────────────────┘  │ - Postmark/SG   │  │ - Deposit Protect │
                             │ - Twilio        │  │ - Portal Feeds    │
                             └─────────────────┘  └───────────────────┘
```

---

## 2.3 Data Model

### Core Entities & Key Fields

**users**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| email | VARCHAR(255) | Unique, indexed |
| phone | VARCHAR(20) | Nullable, indexed |
| password_hash | VARCHAR(255) | Via auth provider |
| name | VARCHAR(255) | |
| role | ENUM | Primary role |
| verification_tier | ENUM | unverified, id_verified, ownership_verified, enhanced_verified |
| status | ENUM | active, suspended, banned |
| jurisdiction_id | VARCHAR(10) | Default jurisdiction |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| last_login_at | TIMESTAMPTZ | |
| metadata | JSONB | Flexible extra data |

**Indexes:** email (unique), phone (unique), status, verification_tier, created_at.

**user_roles** (many-to-many for users who hold multiple roles)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| role | ENUM | seller, landlord, portfolio_landlord, buyer, tenant, delegate, provider, verifier, support, trust_safety, admin |
| granted_at | TIMESTAMPTZ | |
| granted_by | UUID (FK → users) | Nullable |

**delegates**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| delegator_id | UUID (FK → users) | The owner |
| delegate_id | UUID (FK → users) | The assistant |
| permissions | JSONB | Scoped permission set |
| listing_scope | UUID[] | Null = all listings; otherwise specific listing IDs |
| active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

**listings**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| owner_id | UUID (FK → users) | |
| type | ENUM | sale, rental |
| status | ENUM | draft, active, under_offer, let_agreed, sold, let, withdrawn, expired |
| jurisdiction_id | VARCHAR(10) | |
| address_line_1 | VARCHAR(255) | |
| address_line_2 | VARCHAR(255) | Nullable |
| city | VARCHAR(100) | |
| postcode | VARCHAR(20) | |
| country_code | CHAR(2) | |
| location | GEOGRAPHY(POINT) | PostGIS; lat/lng |
| property_type | ENUM | flat, house, bungalow, maisonette, land, commercial, other |
| tenure | ENUM | freehold, leasehold, share_of_freehold, commonhold |
| bedrooms | SMALLINT | |
| bathrooms | SMALLINT | |
| receptions | SMALLINT | |
| area_sqft | INTEGER | Nullable |
| condition | ENUM | new_build, excellent, good, fair, needs_work |
| features | TEXT[] | Array of feature tags |
| description | TEXT | |
| price | INTEGER | In smallest currency unit (pence/cents) |
| pricing_strategy | ENUM | maximize, fast, date_driven |
| pricing_confidence | SMALLINT | 0–100 |
| verification_tier | ENUM | unverified, id_verified, ownership_verified, enhanced_verified |
| published_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| metadata | JSONB | Jurisdiction-specific fields |

**Indexes:** owner_id, status, type, location (GIST), postcode, property_type, bedrooms, price, published_at, created_at. Composite: (status, type, jurisdiction_id). Full-text: description + address.

**rental_details** (1:1 with listings where type=rental)

| Column | Type | Notes |
|--------|------|-------|
| listing_id | UUID (PK, FK → listings) | |
| monthly_rent | INTEGER | Smallest currency unit |
| deposit_amount | INTEGER | |
| min_term_months | SMALLINT | |
| furnished | ENUM | furnished, part_furnished, unfurnished |
| bills_included | TEXT[] | |
| pets_allowed | ENUM | yes, no, negotiable |
| available_from | DATE | |
| epc_rating | CHAR(1) | A–G |

**leasehold_details** (1:1 with listings where tenure=leasehold)

| Column | Type | Notes |
|--------|------|-------|
| listing_id | UUID (PK, FK → listings) | |
| lease_years_remaining | SMALLINT | |
| ground_rent_annual | INTEGER | |
| service_charge_annual | INTEGER | |
| management_company | VARCHAR(255) | |

**listing_media**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| type | ENUM | photo, video, floorplan, epc_certificate, document |
| storage_key | VARCHAR(500) | S3 key |
| cdn_url | VARCHAR(500) | CloudFront URL |
| sort_order | SMALLINT | |
| width | INTEGER | Pixels |
| height | INTEGER | Pixels |
| file_size_bytes | INTEGER | |
| mime_type | VARCHAR(50) | |
| is_verified | BOOLEAN | Uploaded by verified provider |
| created_at | TIMESTAMPTZ | |

**Indexes:** listing_id + sort_order, type.

**enquiries**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| sender_id | UUID (FK → users) | Buyer/tenant |
| message | TEXT | |
| pre_qual_responses | JSONB | Answers to seller's pre-qual questions |
| status | ENUM | new, read, responded, archived, spam |
| created_at | TIMESTAMPTZ | |

**Indexes:** listing_id + status, sender_id, created_at.

**messages**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| conversation_id | UUID (FK → conversations) | |
| sender_id | UUID (FK → users) | |
| body | TEXT | |
| attachments | JSONB | [{key, name, size, mime}] |
| is_system | BOOLEAN | System-generated message |
| created_at | TIMESTAMPTZ | |

**conversations**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | Nullable (deal room convos) |
| deal_room_id | UUID (FK → deal_rooms) | Nullable |
| type | ENUM | enquiry, deal_room, support |
| participant_ids | UUID[] | |
| last_message_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**viewings**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| buyer_id | UUID (FK → users) | |
| seller_id | UUID (FK → users) | |
| scheduled_at | TIMESTAMPTZ | |
| duration_minutes | SMALLINT | Default 30 |
| type | ENUM | private, open_house |
| status | ENUM | requested, confirmed, buyer_confirmed, completed, cancelled, no_show |
| buyer_feedback | JSONB | Rating + notes |
| seller_notes | TEXT | |
| created_at | TIMESTAMPTZ | |

**Indexes:** listing_id + scheduled_at, buyer_id, seller_id, status.

**availability_rules**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| day_of_week | SMALLINT | 0=Sun, 6=Sat; null for one-off |
| start_time | TIME | |
| end_time | TIME | |
| type | ENUM | private_slot, open_house |
| max_attendees | SMALLINT | |
| buffer_minutes | SMALLINT | |
| verification_required | BOOLEAN | |
| effective_from | DATE | |
| effective_to | DATE | Nullable |

**offers**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| buyer_id | UUID (FK → users) | |
| amount | INTEGER | Smallest currency unit |
| conditions | JSONB | {subject_to_survey, subject_to_mortgage, chain_details, custom_conditions} |
| finance_proof_key | VARCHAR(500) | S3 key |
| chain_status | ENUM | chain_free, has_chain, first_time_buyer, cash |
| strength_score | SMALLINT | Computed, 0–100 |
| status | ENUM | submitted, viewed, countered, accepted, rejected, withdrawn, expired |
| expires_at | TIMESTAMPTZ | |
| parent_offer_id | UUID (FK → offers) | For counter-offers |
| rejection_reason | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** listing_id + status, buyer_id, created_at.

**deal_rooms**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| offer_id | UUID (FK → offers) | For sales |
| application_id | UUID (FK → rental_applications) | For rentals |
| type | ENUM | sale, rental |
| status | ENUM | active, completed, cancelled, archived |
| jurisdiction_id | VARCHAR(10) | |
| milestone_template_id | VARCHAR(50) | |
| created_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

**deal_room_milestones**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| deal_room_id | UUID (FK → deal_rooms) | |
| template_milestone_id | VARCHAR(50) | |
| title | VARCHAR(255) | |
| sort_order | SMALLINT | |
| status | ENUM | pending, in_progress, completed, skipped |
| assigned_to_role | VARCHAR(50) | Which stakeholder is responsible |
| completed_at | TIMESTAMPTZ | |
| completed_by | UUID (FK → users) | |
| notes | TEXT | |
| stalled_since | TIMESTAMPTZ | Set when no update for threshold period |

**deal_room_stakeholders**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| deal_room_id | UUID (FK → deal_rooms) | |
| user_id | UUID (FK → users) | |
| role | ENUM | seller, buyer, seller_solicitor, buyer_solicitor, broker, other |
| invited_at | TIMESTAMPTZ | |
| accepted_at | TIMESTAMPTZ | |
| permissions | JSONB | Document-level access |

**deal_room_documents**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| deal_room_id | UUID (FK → deal_rooms) | |
| uploaded_by | UUID (FK → users) | |
| name | VARCHAR(255) | |
| storage_key | VARCHAR(500) | |
| mime_type | VARCHAR(50) | |
| file_size_bytes | INTEGER | |
| version | SMALLINT | |
| access_roles | TEXT[] | Which stakeholder roles can access |
| created_at | TIMESTAMPTZ | |

**rental_applications**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| tenant_id | UUID (FK → users) | |
| status | ENUM | submitted, referencing, approved, rejected, withdrawn |
| employment_status | ENUM | employed, self_employed, student, retired, unemployed |
| annual_income | INTEGER | |
| current_address | TEXT | |
| references | JSONB | [{type, name, contact}] |
| referencing_result | JSONB | From partner API |
| rejection_reason_code | VARCHAR(50) | Structured |
| rejection_reason_note | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**service_providers**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| company_name | VARCHAR(255) | |
| registration_number | VARCHAR(50) | |
| service_types | TEXT[] | |
| service_areas | TEXT[] | Postcodes/regions |
| bio | TEXT | |
| portfolio_urls | TEXT[] | |
| status | ENUM | pending, active, suspended, banned |
| stripe_connect_id | VARCHAR(100) | For payouts |
| average_rating | DECIMAL(3,2) | |
| review_count | INTEGER | |
| on_time_pct | DECIMAL(5,2) | |
| dispute_rate | DECIMAL(5,2) | |
| created_at | TIMESTAMPTZ | |

**service_jobs**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK → listings) | |
| provider_id | UUID (FK → service_providers) | |
| client_id | UUID (FK → users) | Seller/landlord |
| service_type | VARCHAR(50) | |
| status | ENUM | requested, accepted, scheduled, in_progress, delivered, completed, disputed, cancelled |
| price | INTEGER | Smallest currency unit |
| platform_fee | INTEGER | |
| scheduled_at | TIMESTAMPTZ | |
| delivered_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| deliverables | JSONB | [{type, storage_key, name}] |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

**reviews**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| reviewer_id | UUID (FK → users) | |
| reviewee_id | UUID (FK → users) | |
| listing_id | UUID (FK → listings) | Nullable |
| service_job_id | UUID (FK → service_jobs) | Nullable |
| type | ENUM | buyer_to_seller, seller_to_buyer, tenant_to_landlord, landlord_to_tenant, client_to_provider, provider_to_client |
| rating | SMALLINT | 1–5 |
| sub_ratings | JSONB | {communication, accuracy, timeliness, etc.} |
| text | TEXT | |
| status | ENUM | pending_pair, published, flagged, removed |
| created_at | TIMESTAMPTZ | |

**moderation_events**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| target_type | ENUM | listing, user, review, message, service_job |
| target_id | UUID | |
| event_type | ENUM | auto_flag, user_report, manual_review, takedown, reinstate, ban, warn, appeal, appeal_upheld, appeal_overturned |
| reason_code | VARCHAR(50) | |
| details | TEXT | |
| actioned_by | UUID (FK → users) | Nullable (system or human) |
| created_at | TIMESTAMPTZ | |

**audit_logs**

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL (PK) | |
| user_id | UUID | |
| action | VARCHAR(100) | e.g., listing.publish, offer.accept, document.download |
| target_type | VARCHAR(50) | |
| target_id | UUID | |
| ip_address | INET | |
| user_agent | TEXT | |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMPTZ | |

**Indexes:** user_id + created_at, action, target_type + target_id, created_at. Partitioned by month.

**billing_subscriptions**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| stripe_subscription_id | VARCHAR(100) | |
| plan | ENUM | basic, pro, premium, landlord_single, landlord_portfolio, provider_standard, provider_priority |
| status | ENUM | trialing, active, past_due, cancelled, expired |
| current_period_start | TIMESTAMPTZ | |
| current_period_end | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**billing_transactions**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| stripe_payment_id | VARCHAR(100) | |
| type | ENUM | listing_package, verification, boost, service_job, subscription, refund |
| amount | INTEGER | |
| currency | CHAR(3) | |
| status | ENUM | pending, succeeded, failed, refunded |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |

**jurisdiction_configs**

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(10) (PK) | e.g., GB-ENG |
| name | VARCHAR(100) | |
| config | JSONB | Full config object (see Section 1.5) |
| active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**notification_preferences**

| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID (PK, FK → users) | |
| email_enquiries | BOOLEAN | Default true |
| email_viewings | BOOLEAN | Default true |
| email_offers | BOOLEAN | Default true |
| email_deal_room | BOOLEAN | Default true |
| email_marketing | BOOLEAN | Default false |
| sms_viewings | BOOLEAN | Default true |
| sms_offers | BOOLEAN | Default true |
| push_enabled | BOOLEAN | Default false |

**saved_searches**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| filters | JSONB | {location, radius, type, price_min, price_max, bedrooms_min, ...} |
| alert_frequency | ENUM | instant, daily, weekly |
| last_alerted_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### Key Relationships

- users 1→N listings (owner_id)
- listings 1→N listing_media
- listings 1→N enquiries
- listings 1→N viewings
- listings 1→N offers
- listings 1→1 rental_details (if type=rental)
- listings 1→1 leasehold_details (if tenure=leasehold)
- offers 1→1 deal_rooms (sale)
- rental_applications 1→1 deal_rooms (rental)
- deal_rooms 1→N deal_room_milestones
- deal_rooms 1→N deal_room_stakeholders
- deal_rooms 1→N deal_room_documents
- deal_rooms 1→N conversations (deal room type)
- users 1→1 service_providers (if role=provider)
- service_providers 1→N service_jobs
- users 1→N reviews (as reviewer and reviewee)
- users 1→N audit_logs

---

## 2.4 API Surface

All endpoints prefixed with `/api/v1/`. Authentication via Bearer token (Clerk JWT). RBAC enforced at middleware level.

### Auth Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /auth/register | Public | — | Create account |
| POST | /auth/verify-email | Public | — | Verify OTP |
| POST | /auth/login | Public | — | Login |
| POST | /auth/refresh | Auth | All | Refresh token |
| POST | /auth/mfa/enable | Auth | All | Enable MFA |
| GET | /auth/me | Auth | All | Current user profile |
| PATCH | /auth/me | Auth | All | Update profile |
| DELETE | /auth/me | Auth | All | Request account deletion |

### Listings Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /listings | Auth | Seller, Landlord, PL, Delegate | Create listing |
| GET | /listings | Public | — | Search/filter listings |
| GET | /listings/:id | Public | — | Get listing detail |
| PATCH | /listings/:id | Auth | Owner, Delegate, Admin | Update listing |
| POST | /listings/:id/publish | Auth | Owner, Delegate | Publish listing |
| POST | /listings/:id/withdraw | Auth | Owner, Delegate, Admin | Withdraw listing |
| POST | /listings/:id/media | Auth | Owner, Delegate, Provider | Upload media |
| DELETE | /listings/:id/media/:mediaId | Auth | Owner, Delegate | Delete media |
| PATCH | /listings/:id/media/reorder | Auth | Owner, Delegate | Reorder media |
| GET | /listings/:id/pricing | Auth | Owner, Delegate | Get pricing analysis |
| POST | /listings/:id/verify | Auth | Owner | Request verification |
| POST | /listings/:id/boost | Auth | Owner | Purchase boost |

### Enquiries Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /listings/:id/enquiries | Auth | Buyer, Tenant | Submit enquiry |
| GET | /listings/:id/enquiries | Auth | Owner, Delegate, Support, T&S, Admin | List enquiries |
| PATCH | /enquiries/:id | Auth | Owner, Delegate | Update enquiry status |
| POST | /enquiries/:id/respond | Auth | Owner, Delegate | Respond to enquiry |

### Messaging Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /conversations | Auth | All | List user's conversations |
| GET | /conversations/:id/messages | Auth | Participants | Get messages |
| POST | /conversations/:id/messages | Auth | Participants | Send message |
| POST | /conversations/:id/block | Auth | Participants | Block other party |
| POST | /conversations/:id/report | Auth | Participants | Report conversation |

### Viewing Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /listings/:id/availability | Public | — | Get available slots |
| POST | /listings/:id/viewings | Auth | Buyer, Tenant | Book viewing |
| GET | /viewings | Auth | Owner, Buyer, Delegate | List user's viewings |
| PATCH | /viewings/:id | Auth | Owner, Buyer, Delegate | Update viewing (cancel, reschedule) |
| POST | /viewings/:id/confirm | Auth | Buyer, Tenant | Confirm attendance |
| POST | /viewings/:id/feedback | Auth | Buyer, Tenant | Submit feedback |
| POST | /viewings/:id/notes | Auth | Owner, Delegate | Add seller notes |
| PUT | /listings/:id/availability-rules | Auth | Owner, Delegate | Set availability rules |

### Offers Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /listings/:id/offers | Auth | Buyer | Submit offer |
| GET | /listings/:id/offers | Auth | Owner, Delegate, Support, T&S, Admin | List offers |
| GET | /offers/:id | Auth | Owner, Buyer, Delegate | Get offer detail |
| POST | /offers/:id/accept | Auth | Owner, Delegate | Accept offer |
| POST | /offers/:id/reject | Auth | Owner, Delegate | Reject offer |
| POST | /offers/:id/counter | Auth | Owner, Delegate | Counter offer |
| POST | /offers/:id/withdraw | Auth | Buyer | Withdraw offer |
| POST | /listings/:id/best-and-final | Auth | Owner, Delegate | Trigger best-and-final |

### Rental Applications Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /listings/:id/applications | Auth | Tenant | Submit application |
| GET | /listings/:id/applications | Auth | Landlord, PL, Delegate, Support, T&S, Admin | List applications |
| GET | /applications/:id | Auth | Landlord, Tenant, Delegate | Get application detail |
| POST | /applications/:id/accept | Auth | Landlord, PL, Delegate | Accept |
| POST | /applications/:id/reject | Auth | Landlord, PL, Delegate | Reject (requires reason code) |
| POST | /applications/:id/referencing | Auth | Landlord, PL, Delegate | Trigger referencing |

### Deal Room Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /deal-rooms/:id | Auth | Stakeholders | Get deal room |
| PATCH | /deal-rooms/:id/milestones/:mId | Auth | Stakeholders | Update milestone |
| POST | /deal-rooms/:id/documents | Auth | Stakeholders | Upload document |
| GET | /deal-rooms/:id/documents/:docId | Auth | Stakeholders (per-doc ACL) | Download document |
| POST | /deal-rooms/:id/stakeholders | Auth | Owner, Buyer, Admin | Invite stakeholder |
| DELETE | /deal-rooms/:id/stakeholders/:sId | Auth | Owner, Admin | Remove stakeholder |
| POST | /deal-rooms/:id/complete | Auth | Owner, Admin | Mark completed |

### Service Marketplace Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /providers | Public | — | Search providers |
| GET | /providers/:id | Public | — | Provider profile |
| POST | /providers/register | Auth | Any user | Register as provider |
| PATCH | /providers/:id | Auth | Provider (own), Admin | Update provider profile |
| POST | /service-jobs | Auth | Seller, Landlord, PL, Delegate | Create job / request quote |
| GET | /service-jobs | Auth | Client, Provider | List jobs |
| PATCH | /service-jobs/:id | Auth | Client, Provider | Update job status |
| POST | /service-jobs/:id/deliver | Auth | Provider | Deliver assets |
| POST | /service-jobs/:id/complete | Auth | Client | Confirm completion |
| POST | /service-jobs/:id/dispute | Auth | Client, Provider | Raise dispute |

### Reviews Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /reviews | Auth | All (context-dependent) | Submit review |
| GET | /users/:id/reviews | Public | — | Get user's reviews |
| POST | /reviews/:id/flag | Auth | All | Flag review |

### Billing Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /billing/plans | Public | — | List available plans |
| POST | /billing/subscribe | Auth | All | Subscribe to plan |
| PATCH | /billing/subscription | Auth | All | Change/cancel plan |
| GET | /billing/transactions | Auth | All (own) | Transaction history |
| POST | /billing/checkout | Auth | All | One-off purchase (package, verification, boost) |
| POST | /webhooks/stripe | Public (verified) | — | Stripe webhook handler |

### Moderation Module (Admin/T&S only)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /admin/moderation/queue | Auth | T&S, Admin | Get moderation queue |
| POST | /admin/moderation/:id/action | Auth | T&S, Admin | Take moderation action |
| GET | /admin/users/:id | Auth | Support, T&S, Admin | View user detail |
| POST | /admin/users/:id/suspend | Auth | T&S, Admin | Suspend user |
| POST | /admin/users/:id/ban | Auth | T&S, Admin | Ban user |
| GET | /admin/audit-logs | Auth | T&S, Admin | Search audit logs |
| GET | /admin/analytics | Auth | Admin | Platform analytics |
| PATCH | /admin/jurisdictions/:id | Auth | Admin | Update jurisdiction config |

### Verification Module

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /verification/identity | Auth | All | Start ID verification |
| POST | /verification/ownership | Auth | Seller, Landlord | Start ownership verification |
| GET | /verification/status | Auth | All | Check verification status |
| POST | /webhooks/onfido | Public (verified) | — | Onfido webhook |

---

## 2.5 Job / Workflow Engine

Powered by BullMQ (Redis-backed). Workers run on AWS ECS (or Lambda for low-frequency jobs).

### Queue Definitions

| Queue Name | Trigger | Action | Retry | Priority |
|------------|---------|--------|-------|----------|
| email.transactional | API events | Send via Postmark | 3x exponential | High |
| email.marketing | Cron / events | Send via SendGrid | 3x | Low |
| sms.send | API events | Send via Twilio | 3x exponential | High |
| media.process | Media upload | Resize, strip EXIF, generate thumbnails, CDN invalidate | 3x | Medium |
| media.video | Video upload | Transcode, generate poster frame | 2x | Low |
| risk.score | Listing publish / user action | Compute risk score (IP, device, behavior, listing anomaly) | 2x | High |
| viewing.reminder | Cron (every 15 min) | Send 24h reminders for upcoming viewings | 2x | Medium |
| viewing.noshow | Cron (every 30 min) | Check for no-shows, update records, send notifications | 1x | Low |
| deal.nudge | Cron (daily) | Check stalled milestones, send nudges | 2x | Low |
| search.index | Listing changes | Update search index (PG full-text or external) | 3x | Medium |
| analytics.track | API events | Write to analytics store (batch) | 3x | Low |
| referencing.check | Application submitted | Call referencing partner API, poll for result | 5x with long delay | Medium |
| verification.check | Verification requested | Call Onfido API, poll for result | 5x | Medium |
| listing.expire | Cron (daily) | Expire listings past expiry date | 1x | Low |
| subscription.lifecycle | Stripe webhook | Handle subscription state changes | 3x | High |
| payout.process | Cron (weekly) | Process provider payouts via Stripe Connect | 3x | High |

### Cron Jobs

| Schedule | Job | Description |
|----------|-----|-------------|
| Every 15 min | viewing.reminder.scan | Find viewings in 23–25 hour window, enqueue reminders |
| Every 30 min | viewing.noshow.scan | Find past viewings with no completion event, mark no-show |
| Daily 09:00 UTC | deal.nudge.scan | Find stalled milestones, enqueue nudges |
| Daily 02:00 UTC | listing.expire.scan | Find expired listings, update status |
| Daily 03:00 UTC | analytics.daily.aggregate | Aggregate daily KPIs |
| Weekly Monday 06:00 UTC | payout.process.scan | Calculate and process provider payouts |
| Weekly Monday 07:00 UTC | report.weekly | Generate weekly platform report for admin |

---

## 2.6 Observability

### Logging

- Structured JSON logs (pino or winston).
- Every HTTP request logged: method, path, status, duration, user_id, request_id.
- Business events logged: listing.published, offer.submitted, deal_room.created, etc.
- PII redacted from logs (email → masked, phone → masked).
- Log levels: error, warn, info, debug. Production runs at info.
- Shipped to Datadog / Grafana Cloud via log agent.

### Metrics

| Metric | Type | Labels |
|--------|------|--------|
| http_request_duration_seconds | Histogram | method, route, status |
| http_requests_total | Counter | method, route, status |
| listing_publish_total | Counter | jurisdiction, property_type |
| enquiry_submit_total | Counter | jurisdiction |
| viewing_booked_total | Counter | jurisdiction |
| offer_submit_total | Counter | jurisdiction |
| deal_room_created_total | Counter | type |
| deal_completion_total | Counter | type |
| job_queue_depth | Gauge | queue_name |
| job_processing_duration_seconds | Histogram | queue_name |
| job_failed_total | Counter | queue_name |
| active_users | Gauge | role |
| stripe_webhook_received_total | Counter | event_type |
| risk_score_computed_total | Counter | outcome (pass/flag/block) |

### Alerts

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| High error rate | 5xx rate > 1% for 5 min | Critical | PagerDuty + Slack |
| API latency | p95 > 2s for 5 min | Warning | Slack |
| Job queue backup | Depth > 1000 for 15 min | Warning | Slack |
| Job failure spike | Failed jobs > 50/hour | Critical | PagerDuty + Slack |
| Payment webhook failures | Stripe webhook 4xx > 10/hour | Critical | PagerDuty |
| Disk usage | > 80% | Warning | Slack |
| Database connections | > 80% pool | Warning | Slack |
| Certificate expiry | < 14 days | Warning | Email |

### Error Tracking

- Sentry for all environments.
- Source maps uploaded in CI.
- Error grouping by stack trace.
- User context attached (user_id, role, jurisdiction).
- Release tracking (deploy SHA linked to errors).

---

# PART 3 — SECURITY & PRIVACY PACK

---

## 3.1 Threat Model (STRIDE)

| Threat | Category | Example | Mitigation |
|--------|----------|---------|------------|
| Fake identity registration | Spoofing | Attacker creates account with stolen identity | Tiered verification (KYC via Onfido), email/phone OTP, device fingerprinting |
| Session hijacking | Spoofing | Attacker steals session token | HttpOnly + Secure + SameSite cookies, short token expiry, refresh rotation, MFA on sensitive actions |
| Listing data modification | Tampering | Attacker modifies listing price or status | RBAC enforcement, ownership checks, audit logging, request signing for critical actions |
| Offer manipulation | Tampering | Attacker modifies offer amount after submission | Offers are immutable once submitted; amendments create new versions; audit trail |
| Document vault tampering | Tampering | Attacker modifies uploaded documents | Integrity hashes on upload, version history, access-controlled signed URLs |
| Data exfiltration | Information Disclosure | Attacker scrapes user PII | Rate limiting, authentication required for PII endpoints, field-level access control, scraping detection |
| Deal room data leak | Information Disclosure | Unauthorised party accesses deal documents | Per-document ACL, stakeholder verification, audit logs on every access |
| API abuse | Denial of Service | Attacker floods endpoints | Rate limiting (Redis-based), WAF rules, CAPTCHA on high-risk actions, CDN caching for public endpoints |
| Listing spam | Denial of Service | Attacker creates thousands of fake listings | Account verification requirements, risk scoring on listing creation, moderation queue |
| Admin account compromise | Elevation of Privilege | Attacker gains admin access | MFA required for all admin accounts, IP allowlisting for admin console, separate admin auth domain, privileged action audit logging |
| Provider impersonation | Spoofing | Attacker pretends to be legitimate service provider | Business verification (Companies House check), portfolio review, identity verification |
| Fake reviews | Repudiation | Provider creates fake positive reviews | Review gating (must have completed transaction), duplicate detection, anomaly scoring |

## 3.2 OWASP Top 10 Mitigations

| # | Vulnerability | Mitigation |
|---|--------------|------------|
| A01 | Broken Access Control | RBAC middleware on every endpoint; ownership verification; resource-level checks; deny by default; CORS strict origin |
| A02 | Cryptographic Failures | TLS 1.2+ everywhere; AES-256 encryption at rest (RDS, S3); bcrypt for passwords (via auth provider); secrets in Secrets Manager |
| A03 | Injection | Parameterised queries via ORM (Prisma); input validation (zod schemas); CSP headers; output encoding |
| A04 | Insecure Design | Threat modeling (STRIDE above); security requirements in stories; abuse case testing; rate limiting by design |
| A05 | Security Misconfiguration | Hardened headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP); no default credentials; automated security scanning in CI |
| A06 | Vulnerable Components | Dependabot + Snyk in CI; npm audit; automated PR for security patches; component inventory |
| A07 | Auth Failures | Clerk/Auth0 handles auth; MFA available; brute-force protection (rate limit + lockout); password policy enforcement |
| A08 | Software/Data Integrity | Signed deployments; integrity checks on uploaded files; CSP with nonces for inline scripts; dependency lockfile verification |
| A09 | Logging & Monitoring | Structured logging; security events in dedicated stream; real-time alerting; 90-day log retention; immutable audit logs |
| A10 | SSRF | Validate/allowlist external URLs; no user-controlled redirects to internal services; metadata endpoint blocking |

## 3.3 Secure File Upload Plan

1. **Client-side validation**: File type check (accept attribute), max size (50MB images, 200MB video, 20MB documents).
2. **Presigned URL upload**: Client requests presigned S3 PUT URL from API (with content-type and size constraints). File goes directly to S3, never through application server.
3. **Post-upload processing** (async via media.process queue):
   - MIME type verification (magic bytes check, not just extension).
   - EXIF metadata stripping (Sharp for images).
   - Image resizing to standard breakpoints.
   - Antivirus scan approach: ClamAV Lambda or S3 Object Lambda.
   - If scan fails: file quarantined, user notified, listing media slot remains empty.
4. **Storage**: Private S3 bucket. Access only via CloudFront signed URLs (time-limited, per-user where needed).
5. **Document vault (Deal Room)**: Same upload flow. Additional: integrity hash (SHA-256) computed and stored. Version history maintained. Per-document access control checked on every signed URL generation.

## 3.4 RBAC Enforcement Plan & Audit Logging

**Enforcement layers:**

1. **API Middleware** (`requireAuth` → `requireRole` → `requireResourceAccess`): Every request passes through auth verification, role check, and resource ownership/access check before reaching handler.
2. **Database-level**: Row-level security (RLS) on sensitive tables where supported (Supabase/native PG). Fallback: application-level filtering.
3. **Frontend**: Route guards and UI conditional rendering (defense in depth, not primary control).

**Audit logging model:**

- Every create, update, delete on sensitive entities triggers an audit log write.
- Audit log table is append-only (no UPDATE or DELETE permissions granted to application role).
- Fields: user_id, action, target_type, target_id, ip_address, user_agent, metadata (JSONB for context), timestamp.
- Partitioned by month for query performance.
- Retained for minimum 7 years (regulatory compliance).
- Searchable via admin console with filters (user, action, date range, target).

## 3.5 Data Retention, Deletion & Export Policy

| Data Category | Retention Period | Deletion Trigger | Notes |
|--------------|-----------------|-----------------|-------|
| User account data | Duration of account + 30 days | User deletion request | Anonymised after 30-day grace period |
| Listing data (active) | Duration of listing | Listing withdrawal + 90 days | Retained for search history integrity |
| Listing data (completed) | 7 years | Auto-archive | Tax/legal compliance |
| Deal room documents | 7 years | Auto-archive | Legal compliance |
| Messages | 3 years | Auto-purge | Except where linked to active dispute |
| Audit logs | 7 years | Auto-purge | Regulatory compliance |
| Analytics events | 3 years | Auto-purge | Aggregated data retained indefinitely |
| Media files | Listing retention + 30 days | Auto-delete from S3 | CDN cache auto-expires |
| Payment records | 7 years | Auto-archive | Financial compliance |
| Verification data | Account duration + 30 days | User deletion request | KYC provider may have own retention |

**User rights (GDPR / UK GDPR):**

- **Right to access**: User can request data export (JSON format) via settings. Automated within 72 hours.
- **Right to deletion**: User submits deletion request via settings. 30-day grace period (account deactivated). After 30 days: PII anonymised (name → "Deleted User", email → hashed, phone → null). Transactional records retained with anonymised user reference.
- **Right to portability**: Data export includes: profile, listings, messages, offers, documents, reviews.
- **Right to rectification**: User can edit profile data at any time.

## 3.6 Incident Response Runbook

**Severity Levels:**

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|---------|
| SEV1 | Platform down or data breach | 15 min | Full outage, PII exposure, payment system breach |
| SEV2 | Major feature broken, data integrity risk | 1 hour | Deal room inaccessible, duplicate charges, auth failure |
| SEV3 | Minor feature broken, workaround exists | 4 hours | Media upload failing, notification delays |
| SEV4 | Cosmetic or low-impact | 24 hours | UI bug, minor copy error |

**Response Process:**

1. **Detect**: Alert fires (PagerDuty / Sentry / user report). On-call engineer paged for SEV1/SEV2.
2. **Triage**: Assess severity. Assign incident commander (IC). Open incident Slack channel.
3. **Communicate**: Post status page update (within 15 min for SEV1, 1 hour for SEV2). Notify affected users if data breach.
4. **Mitigate**: Implement fix or rollback. Rollback procedure: revert deployment to last known good (Vercel instant rollback). Database: apply rollback migration if schema change caused issue.
5. **Resolve**: Confirm fix. Monitor for recurrence. Close incident channel.
6. **Post-mortem**: Within 48 hours for SEV1/SEV2. Document: timeline, root cause, impact, fix, preventive actions. Share with team. Track action items to completion.

**Data Breach Specific:**

- ICO notification within 72 hours (UK GDPR requirement).
- Affected user notification without undue delay.
- Forensic investigation: preserve logs, isolate affected systems, engage external security firm if needed.
- Legal counsel engaged immediately.

---

# PART 4 — TESTING PACK

---

## 4.1 Test Strategy

| Test Type | Framework | Coverage Target | Responsibility |
|-----------|----------|-----------------|----------------|
| Unit | Jest (TypeScript) | >80% line coverage on business logic | All developers |
| Integration | Jest + Supertest + test DB | All API endpoints with auth scenarios | Backend team |
| End-to-End | Playwright | All critical user flows | QA + automated in CI |
| Visual Regression | Playwright screenshots | Key pages (listing, dashboard, deal room) | CI automated |
| Performance | k6 | Listing pages <200ms p95; API <500ms p95 | DevOps |
| Security | OWASP ZAP (DAST), Snyk (SAST/SCA) | Zero critical/high vulnerabilities | CI automated |

## 4.2 CI Pipeline Gates

```
PR Opened / Push to branch:
  ├── Lint (ESLint + Prettier) — must pass
  ├── Type Check (tsc --noEmit) — must pass
  ├── Unit Tests (Jest) — must pass, >80% coverage
  ├── Integration Tests (Jest + test DB) — must pass
  ├── SAST (Snyk Code) — no critical/high
  ├── Dependency Scan (Snyk Open Source) — no critical
  ├── Secrets Scan (TruffleHog / GitLeaks) — no findings
  └── Build (Next.js build) — must succeed

Merge to main:
  ├── All above gates
  ├── E2E Tests (Playwright against staging) — must pass
  ├── DAST (ZAP baseline scan against staging) — no critical
  ├── Deploy to Staging
  └── Smoke Tests (health check + key flows)

Deploy to Production:
  ├── Manual approval (for major releases)
  ├── Canary deployment (10% traffic)
  ├── Smoke Tests
  ├── Monitor error rates (15 min)
  └── Full rollout (or rollback if errors spike)
```

## 4.3 Minimum Critical E2E Scenarios (Playwright)

1. **Seller creates and publishes listing (sale)**: Register → fill listing form → upload photos → set price → publish → verify listing appears in search.
2. **Buyer enquires on listing**: Register → search → find listing → submit enquiry → verify seller sees enquiry in inbox.
3. **Viewing booking flow**: Buyer books viewing → both parties receive confirmation → buyer confirms attendance → seller adds notes.
4. **Offer submission and acceptance**: Buyer submits structured offer → seller sees in comparison table → seller accepts → verify Deal Room created → listing status changes to "Under Offer."
5. **Counter-offer flow**: Seller counters → buyer sees counter → buyer accepts counter → Deal Room created.
6. **Deal Room document upload and milestone update**: Stakeholder uploads document → other stakeholder can access → milestone updated → status dashboard reflects change.
7. **Landlord rental flow**: Create rental listing → tenant enquires → tenant applies → referencing triggered (mock) → landlord accepts → tenancy agreement generated.
8. **Service provider job**: Seller books photographer → provider accepts → provider delivers photos → photos appear in listing media → seller marks complete.
9. **Admin moderation**: Risk-flagged listing enters queue → T&S reviews → takedown → seller receives notification → seller appeals → T&S reviews appeal.
10. **Billing flow**: Seller purchases Pro package → payment succeeds → features unlocked → invoice generated.
11. **Verification flow**: User initiates ID verification → mock Onfido callback → badge updated on profile and listings.
12. **No-show handling**: Buyer books viewing → doesn't confirm → marked no-show → after 3 no-shows, booking restricted.

## 4.4 Performance / Load Smoke Tests

| Scenario | Target | Tool |
|----------|--------|------|
| Listing page load (SSR) | <200ms p95 (cached), <500ms p95 (uncached) | k6 |
| Listing search API | <300ms p95 for 100 concurrent users | k6 |
| Media upload (presigned URL generation) | <100ms p95 | k6 |
| Enquiry submission | <200ms p95 | k6 |
| Deal Room load | <400ms p95 | k6 |
| Concurrent viewing bookings (same listing) | No double-booking under 50 concurrent requests | k6 |

---

# PART 5 — DOCUMENTATION PACK

---

## 5.1 Repository Documentation Structure

```
/docs
  /architecture
    overview.md            — System architecture overview + component diagram
    data-model.md          — Entity relationship descriptions + diagrams
    decisions/             — Architecture Decision Records (ADRs)
      001-nextjs-stack.md
      002-postgres-over-nosql.md
      003-clerk-auth.md
      ...
  /api
    openapi.yaml           — Full OpenAPI 3.1 spec
    authentication.md      — Auth flows + token handling
    error-codes.md         — Standard error response format + codes
    rate-limits.md         — Rate limit policy per endpoint
    webhooks.md            — Webhook payloads + verification
  /guides
    local-dev-setup.md     — Step-by-step dev environment setup
    deployment.md          — CI/CD pipeline + deployment procedures
    database-migrations.md — How to create + apply migrations
    adding-jurisdiction.md — How to configure a new market
    adding-provider-type.md — How to add new service category
  /runbooks
    deploy-rollback.md     — Deployment + rollback procedures
    incident-response.md   — Full incident response process
    outage-response.md     — Specific outage scenarios + fixes
    database-failover.md   — RDS failover procedure
    secrets-rotation.md    — How to rotate secrets
  /playbooks
    moderation.md          — Content moderation decision tree + examples
    support.md             — Support triage + SLA definitions + escalation paths
    fraud-investigation.md — Fraud detection + investigation steps
    dispute-resolution.md  — Dispute handling process + resolution options
    provider-onboarding.md — Provider verification checklist
  /security
    security-policy.md     — Security standards + patch cadence
    threat-model.md        — STRIDE analysis
    data-classification.md — Data categories + handling rules
    privacy-policy-ops.md  — Internal privacy operations guide
  /product
    release-checklist.md   — Pre-release checklist
    feature-flags.md       — Feature flag conventions + management
    jurisdiction-config.md — Jurisdiction plugin schema reference

README.md                  — Project overview + quick start
CONTRIBUTING.md            — Contribution guidelines
CHANGELOG.md               — Release notes
```

## 5.2 OpenAPI Plan

- Full OpenAPI 3.1 specification generated from route definitions (using zod-to-openapi or similar).
- Hosted via Swagger UI at `/api/docs` (staging/dev only; disabled in production).
- Versioned: `/api/v1/` prefix. Breaking changes require new version.
- Webhook schemas documented alongside API endpoints.
- Authentication schemes documented (Bearer JWT, webhook signature verification).
- Response schemas include error format: `{ error: { code: string, message: string, details?: object } }`.

## 5.3 Runbooks Summary

**Deploy & Rollback:**

- Deploy: merge to main → CI passes → auto-deploy to staging → manual promote to production (or auto with canary).
- Rollback: Vercel instant rollback (one click / one CLI command). Database: run rollback migration script.
- Hotfix: branch from main → fix → PR → expedited review → merge → deploy.

**Outage Response:**

- Health check endpoint: `/api/health` returns 200 with DB + Redis + S3 connectivity status.
- If web down: check Vercel status, check DNS, check CDN.
- If API down: check server logs (Sentry/Datadog), check DB connectivity, check Redis.
- If payments down: check Stripe status page, check webhook delivery, switch to maintenance mode for payment features.

## 5.4 Moderation Playbook Summary

**Decision Tree:**

1. Auto-flagged listing enters queue → reviewer opens listing.
2. Check: Is content discriminatory? → Remove + warn user.
3. Check: Is listing suspected scam (anomaly score > threshold, no verification)? → Suspend listing + request verification from owner.
4. Check: Is media inappropriate? → Remove media + notify user.
5. Check: Is pricing extremely anomalous (>3σ from area mean)? → Add "price may be inaccurate" label (don't remove).
6. User report: harassment → review messages → warn/suspend.
7. User report: scam → escalate to fraud investigation playbook.
8. Appeal received → different reviewer assesses → uphold or overturn with documented reasoning.

**Support Playbook Summary:**

| Category | SLA (first response) | Escalation Path |
|----------|---------------------|-----------------|
| Account access issues | 2 hours | Support → Engineering (if system issue) |
| Listing problems | 4 hours | Support → Moderation (if policy) |
| Payment issues | 2 hours | Support → Billing team → Stripe support |
| Deal room stuck | 4 hours | Support → Product (if system issue) |
| Fraud report | 1 hour | Support → Trust & Safety |
| General enquiry | 8 hours | Support |

---

# PART 6 — GO-TO-MARKET SYSTEM

---

## 6.1 Positioning & Copy Blocks

**Primary positioning:** "Sell or rent your property without an agent. Keep the fee."

**Supporting messages:**

- "A guided workflow that actually closes deals."
- "Verified sellers. Direct communication. Transparent transactions."
- "Professional tools. No agent commission."

**Copy blocks (landing page):**

- Hero: "Sell your home without paying thousands in agent fees. NoAgent gives you the professional tools, guided workflow, and verified marketplace to handle it yourself — from listing to completion."
- How It Works: "List in minutes. Handle enquiries with smart tools. Schedule viewings on your terms. Compare offers side by side. Close with confidence in a secure deal room."
- Trust: "Every seller can verify their identity and ownership. Every transaction is tracked and transparent. We never touch your money — regulated partners handle the legal and financial bits."
- Pricing: "Start free. Upgrade for professional photos, priority placement, and verification badges. No hidden fees. No commission."

**Rental-specific:** "Rent out your property with confidence. Find verified tenants, handle applications, and set up tenancies — all in one place."

## 6.2 Website Page Map + Programmatic SEO Templates

### Static Pages

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | / | Hero + how it works + trust + pricing |
| How It Works | /how-it-works | Detailed flow + video |
| Pricing | /pricing | Packages + comparison table |
| About | /about | Team + mission |
| Blog | /blog | Content marketing hub |
| Help Centre | /help | FAQ + guides |
| Contact | /contact | Support form |
| Terms | /terms | Terms of service |
| Privacy | /privacy | Privacy policy |
| For Landlords | /landlords | Rental-specific value prop |
| For Buyers | /buyers | Buyer-specific value prop |
| Service Marketplace | /services | Provider directory |

### Programmatic SEO Pages (auto-generated)

| Template | URL Pattern | Data Source | Example |
|----------|-------------|------------|---------|
| Area sell page | /sell-property-in/{area} | Postcode/area database + listing count | /sell-property-in/clapham |
| Area rent page | /rent-property-in/{area} | Same | /rent-property-in/manchester |
| Area + type | /sell-{type}-in/{area} | Cross-product | /sell-flat-in-islington |
| Property type guide | /how-to-sell-a/{type} | Content templates | /how-to-sell-a-leasehold-flat |
| Listing page | /property/{slug} | Listing data | /property/2-bed-flat-sw11-1ab |
| Provider profile | /services/{type}/{slug} | Provider data | /services/photography/london-property-photos |

**SEO structure for programmatic pages:**

- Unique H1 per page with area/type.
- Dynamic content: listing count, average price, recent sales, demand indicators.
- Schema.org markup: RealEstateListing, Place, LocalBusiness.
- Internal linking: area → nearby areas, type variants.
- Canonical URLs to prevent duplication.

## 6.3 Analytics Event Taxonomy

### Naming Convention

`{object}.{action}` in snake_case. Properties in camelCase.

### Core Events

| Event Name | Trigger | Key Properties |
|------------|---------|---------------|
| page.viewed | Page load | pageType, pagePath, referrer, jurisdiction |
| listing.creation_started | User starts listing form | listingType (sale/rental) |
| listing.step_completed | User completes a listing form step | stepName, stepNumber, listingType |
| listing.media_uploaded | Photo/video added | mediaType, count, source (user/provider) |
| listing.pricing_viewed | User views pricing analysis | suggestedPrice, confidenceScore |
| listing.published | Listing goes live | listingId, listingType, propertyType, jurisdiction, priceBand, verificationTier |
| listing.boosted | User purchases boost | listingId, boostType, amount |
| listing.withdrawn | Listing withdrawn | listingId, reason, daysLive |
| search.performed | User searches listings | filters (location, type, price, beds), resultCount |
| search.alert_created | User creates saved search | filters, alertFrequency |
| enquiry.submitted | Buyer/tenant submits enquiry | listingId, buyerVerified, hasAIP |
| enquiry.responded | Seller responds to enquiry | listingId, responseTimeMinutes |
| viewing.booked | Viewing scheduled | listingId, viewingType, daysFromEnquiry |
| viewing.confirmed | Buyer confirms attendance | listingId, viewingId |
| viewing.completed | Viewing marked complete | listingId, viewingId |
| viewing.no_show | No-show recorded | listingId, viewingId, party (buyer/seller) |
| offer.submitted | Offer made | listingId, offerAmount, askingPrice, conditions, chainStatus, buyerVerified |
| offer.countered | Counter-offer made | listingId, offerId, counterAmount |
| offer.accepted | Offer accepted | listingId, offerId, finalAmount, daysToAccept |
| offer.rejected | Offer rejected | listingId, offerId, reason |
| best_and_final.triggered | Seller triggers B&F | listingId, activeOfferCount |
| deal_room.created | Deal room opened | dealRoomId, type, listingId |
| deal_room.milestone_updated | Milestone status changed | dealRoomId, milestoneName, newStatus |
| deal_room.document_uploaded | Document added | dealRoomId, documentType, uploaderRole |
| deal_room.stakeholder_invited | Stakeholder added | dealRoomId, stakeholderRole |
| deal_room.completed | Transaction completed | dealRoomId, type, daysToComplete, finalPrice |
| application.submitted | Rental application made | listingId, tenantVerified |
| application.accepted | Application accepted | listingId, applicationId, daysToDecision |
| application.rejected | Application rejected | listingId, applicationId, reasonCode |
| referencing.started | Referencing initiated | applicationId |
| referencing.completed | Referencing result received | applicationId, outcome |
| service_job.created | Service booked | serviceType, providerId, price |
| service_job.completed | Service delivered + confirmed | serviceType, providerId, daysToComplete |
| service_job.disputed | Dispute raised | serviceType, providerId, reason |
| billing.checkout_started | User initiates purchase | productType, amount |
| billing.payment_succeeded | Payment completed | productType, amount, method |
| billing.payment_failed | Payment failed | productType, amount, failureReason |
| billing.subscription_started | Subscription created | planName, amount |
| billing.subscription_cancelled | Subscription cancelled | planName, reason, daysActive |
| verification.started | User initiates verification | tier |
| verification.completed | Verification result | tier, outcome (pass/fail) |
| user.registered | Account created | method (email/social), jurisdiction |
| user.verified_email | Email verified | — |
| moderation.listing_flagged | Listing auto-flagged | listingId, flagReason, riskScore |
| moderation.action_taken | Moderator takes action | targetType, targetId, actionType |

### Dashboard KPIs

| KPI | Calculation | Dashboard |
|-----|------------|-----------|
| Publish rate | listing.published / listing.creation_started | Funnel |
| Enquiry rate (7d) | enquiry.submitted / listing.published (within 7 days) | Listing health |
| Viewing booking rate | viewing.booked / enquiry.submitted | Funnel |
| Offer rate | offer.submitted / viewing.completed | Funnel |
| Offer acceptance rate | offer.accepted / offer.submitted | Funnel |
| Completion rate | deal_room.completed / deal_room.created | Funnel |
| Median days to completion | Median(deal_room.completed.timestamp - deal_room.created.timestamp) | Funnel |
| Service attach rate | service_job.created / listing.published | Revenue |
| Verification attach rate | verification.completed / user.registered | Trust |
| CAC | Total marketing spend / user.registered (by channel) | Marketing |
| LTV | Revenue per user (12-month trailing) | Revenue |
| Fraud rate | moderation.listing_flagged (scam) / listing.published | Trust |
| Provider on-time % | On-time deliveries / total deliveries | Marketplace |
| Support SLA compliance | Responses within SLA / total tickets | Operations |

## 6.4 Lifecycle Email/SMS Sequences

### Seller Sequences

| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| Account created | Email | Immediate | Welcome + "Complete your first listing" CTA |
| Listing started but not published | Email | +24 hours | "Your listing is 70% ready — finish it now" |
| Listing started but not published | Email | +72 hours | "Need help? Here's what other sellers did" |
| Listing published | Email + SMS | Immediate | "You're live! Share your listing" + social share links |
| First enquiry received | Email + SMS | Immediate | "You have your first enquiry — respond quickly for best results" |
| No response to enquiry in 12h | SMS | +12 hours | "You have an unanswered enquiry. Quick responses lead to faster sales." |
| First viewing booked | Email | Immediate | "Viewing confirmed — here's how to prepare" |
| First offer received | Email + SMS | Immediate | "You've received an offer — review it now" |
| Offer accepted | Email | Immediate | "Congratulations! Your Deal Room is ready" |
| Deal room stalled (14 days) | Email | Day 14 | "Your transaction needs attention — here's what's next" |
| Completion | Email | Immediate | "Sold! Leave a review + refer a friend" |
| Listing expired (no sale in 90 days) | Email | Day 90 | "Your listing has expired — relist with a new strategy?" |

### Buyer Sequences

| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| Account created | Email | Immediate | Welcome + "Set up your search alerts" |
| Saved search created | Email | Immediate | "We'll notify you when new properties match" |
| New listing matches alert | Email | Within 1 hour | "New property in [area] matching your search" |
| Enquiry sent, no seller response in 48h | Email | +48 hours | "Still waiting? Here are similar properties" |
| Viewing confirmed | Email + SMS | Immediate | Confirmation + directions + what to bring |
| 24h before viewing | SMS | -24 hours | Reminder + confirm attendance CTA |
| Post-viewing (no offer in 7 days) | Email | +7 days | "Thinking about [property]? Here's how to make an offer" |
| Offer accepted | Email | Immediate | "Your offer was accepted — next steps in your Deal Room" |

### Landlord Sequences

Similar to seller, with rental-specific content (application received, referencing complete, tenancy ready to sign).

### Provider Sequences

| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| Registration complete | Email | Immediate | "Set up your profile and start receiving jobs" |
| First job request | Email + SMS | Immediate | "New job request — respond within 4 hours" |
| Job delivered, awaiting confirmation | Email | +48 hours | "Your delivery is awaiting client confirmation" |
| Weekly payout | Email | Weekly | Payout summary + earnings dashboard link |

## 6.5 City Launch Playbook

### Pre-Launch (4 weeks before)

1. Configure jurisdiction settings (if new country) or area-specific data (if existing country).
2. Seed area pages (programmatic SEO) with local market data.
3. Recruit 5–10 service providers (photographers, EPC assessors) in target area. Offer launch incentives (reduced/waived fees for first 3 months).
4. Recruit 3–5 "founding sellers" — offer premium package free in exchange for case study permission.
5. Set up local Google Ads campaigns targeting high-intent keywords ("sell house [area] without agent", "list flat [area] no agent fee").
6. Create area-specific content (blog post: "How to sell in [area] without an agent — 2026 guide").

### Launch Week

7. Publish founding seller listings.
8. Activate Google Ads.
9. Local PR outreach: property journalists, local media, property forums.
10. Founding sellers share listings on social media (provided share kit).
11. Monitor: enquiry rate, viewing rate, provider response times.

### Post-Launch (ongoing)

12. Track funnel metrics weekly. Target: >50% of published listings receive enquiry within 7 days.
13. First completion = "proof loop" content piece ("Sold in [X] days, saved £[Y]").
14. Provider referral program: providers who refer sellers earn credit.
15. Seller referral program: sellers who refer other sellers earn listing credit.
16. Scale Google Ads based on CAC vs. LTV data.
17. Expand to adjacent areas once area metrics hit threshold (>20 active listings, >5 completions).

## 6.6 Partner Acquisition Playbook

### Provider Partners (Photography, EPC, Legal, etc.)

1. Identify top-rated providers in target area (Google Maps, Trustpilot, industry directories).
2. Outreach: "Join NoAgent's marketplace — we send you qualified leads with zero acquisition cost."
3. Onboarding: profile setup, verification, pricing config, test job.
4. Launch incentive: no platform fee for first 10 jobs.
5. Performance review at 30 days: on-time %, rating, dispute rate.
6. Top performers get "Featured Provider" badge.

### Portal Partners (Rightmove, Zoopla, etc. — where applicable)

1. Apply for data feed partnership.
2. Technical integration: build listing export in portal-required format (BLM/REAXML/equivalent).
3. Compliance review: ensure listing data meets portal standards.
4. Launch: sellers can opt-in to syndication from listing settings.

---

# PART 7 — EXECUTION PLAN

---

## 7.1 Work Breakdown Structure

### Epic 1: Foundation (Weeks 1–4)

**Stories:**

- E1.1: Repository setup, CI/CD pipeline, environment configuration (dev/staging/prod)
- E1.2: Database schema design + initial migrations (users, listings, core tables)
- E1.3: Auth integration (Clerk/Auth0) with RBAC middleware
- E1.4: Base UI component library (design system) + layout templates
- E1.5: File upload infrastructure (S3 presigned URLs, media processing worker)
- E1.6: Email/SMS service integration (Postmark, Twilio)
- E1.7: Structured logging + error tracking (Sentry, Datadog)

**Acceptance Criteria:** Developer can register, login with MFA, upload a file, and receive email confirmation. CI pipeline runs lint + typecheck + unit tests + build on every PR. Staging environment accessible.

### Epic 2: Listing Creation & Search (Weeks 3–8)

**Stories:**

- E2.1: Listing creation form (multi-step, sale + rental variants)
- E2.2: Address validation + geocoding integration
- E2.3: Media upload flow (photos, floorplan, video) with processing pipeline
- E2.4: Compliance content scanner (description check)
- E2.5: Pricing engine (comparables API integration, strategy selector, confidence score)
- E2.6: Listing publish workflow (preview → publish → moderation flag if needed)
- E2.7: Listing status machine (draft → active → under offer → sold/let → withdrawn → expired)
- E2.8: Public listing page (SSR, schema.org markup, OG tags)
- E2.9: Marketplace search (filters, map view, PostGIS queries)
- E2.10: Saved searches + alerts (email notification on new matches)
- E2.11: Listing detail page (gallery, details, enquiry CTA, viewing CTA)

**Acceptance Criteria:** Seller can create, preview, and publish a listing. Buyer can search, filter (location/price/type/beds), view on map, and see listing detail page. Listing pages render with full SEO markup. Saved search triggers email when new match published.

### Epic 3: Enquiries & Messaging (Weeks 6–10)

**Stories:**

- E3.1: Enquiry submission form (guided fields)
- E3.2: Seller inbox (per-listing and global)
- E3.3: Masked contact relay (email proxy, SMS proxy)
- E3.4: In-platform messaging (real-time via WebSocket or polling)
- E3.5: Spam detection + rate limiting on enquiry endpoints
- E3.6: Auto-response configuration
- E3.7: Pre-qualification question templates
- E3.8: Block/report functionality
- E3.9: Lead quality indicators (buyer verification, AIP, responsiveness)

**Acceptance Criteria:** Buyer submits enquiry, seller receives in inbox + email notification. Masked comms work (buyer never sees seller's real email/phone). Spam is filtered. Seller can block/report. Response time tracked.

### Epic 4: Viewing Scheduler (Weeks 8–12)

**Stories:**

- E4.1: Availability rule builder (recurring + one-off slots)
- E4.2: Viewing booking flow (buyer selects slot → confirmation)
- E4.3: Automated confirmations + reminders (email + SMS)
- E4.4: 24-hour attendance confirmation prompt
- E4.5: No-show detection + strike tracking
- E4.6: Post-viewing feedback (buyer) + notes (seller)
- E4.7: Cancellation / reschedule flow
- E4.8: Open house support (multiple attendees per slot)

**Acceptance Criteria:** Seller sets availability, buyer books, both receive confirmation + 24h reminder. No-show detection works. Post-viewing feedback captured. Calendar integration (iCal) works.

### Epic 5: Offers & Negotiation (Weeks 10–14)

**Stories:**

- E5.1: Structured offer form (amount, conditions, finance proof, chain, expiry)
- E5.2: Offer strength scoring algorithm
- E5.3: Offer comparison dashboard (seller view)
- E5.4: Accept / reject / counter-offer / withdraw flows
- E5.5: Best-and-final round mechanism
- E5.6: Negotiation message threading
- E5.7: Auto-status transitions (accepted → listing Under Offer → Deal Room created)
- E5.8: Notifications to all parties on offer events

**Acceptance Criteria:** Buyer submits offer, seller sees with strength score, can counter/accept/reject. Deal Room auto-created on acceptance. Listing status updates. All parties notified.

### Epic 6: Deal Room (Weeks 12–18)

**Stories:**

- E6.1: Deal Room creation (from accepted offer or application)
- E6.2: Milestone checklist engine (jurisdiction templates)
- E6.3: Document vault (upload, version, per-document ACL)
- E6.4: Stakeholder management (invite/remove solicitors, brokers)
- E6.5: Deal Room messaging (audited)
- E6.6: Status dashboard + blocker identification
- E6.7: Automated stall nudges
- E6.8: E-signature integration (DocuSign/Adobe API)
- E6.9: Completion workflow + post-completion actions

**Acceptance Criteria:** Deal Room created with correct milestones for jurisdiction. Documents uploadable with access control. Stakeholders can be invited and see only permitted documents. Nudges fire when milestone stalls. E-signature flow works end-to-end.

### Epic 7: Rental Extensions (Weeks 14–20)

**Stories:**

- E7.1: Rental application form + submission flow
- E7.2: Referencing partner integration
- E7.3: Right-to-rent check integration (UK jurisdiction)
- E7.4: Application comparison dashboard
- E7.5: Accept/reject with structured reasons
- E7.6: Tenancy agreement template engine
- E7.7: Deposit collection (via payment partner)
- E7.8: Deposit protection scheme handoff
- E7.9: Inventory / check-in partner booking
- E7.10: Move-in pack generation

**Acceptance Criteria:** Tenant can apply, landlord can review referencing results, accept/reject with logged reasons. Tenancy agreement generated from template and e-signed. Deposit collected and registered with protection scheme. Inventory booking works.

### Epic 8: Service Marketplace (Weeks 16–22)

**Stories:**

- E8.1: Provider registration + onboarding flow
- E8.2: Provider profile pages
- E8.3: Service catalog + search
- E8.4: Job booking flow (instant book + request quote)
- E8.5: Scheduling + reminders for jobs
- E8.6: Asset delivery (photos/floorplans direct to listing)
- E8.7: Stripe Connect integration (provider payouts)
- E8.8: Review system for providers
- E8.9: Provider performance dashboard
- E8.10: Dispute resolution workflow
- E8.11: Bundle products ("List Like a Pro" etc.)

**Acceptance Criteria:** Provider can register, set up services, receive and accept jobs. Assets delivered to listing. Payouts processed weekly via Stripe Connect. Reviews and performance metrics visible. Disputes can be raised and resolved.

### Epic 9: Verification & Trust (Weeks 12–16)

**Stories:**

- E9.1: ID verification flow (Onfido integration)
- E9.2: Ownership verification flow (document upload + partner check)
- E9.3: Enhanced verification flow
- E9.4: Badge display on listings + profiles
- E9.5: Risk scoring engine (IP, device, behavior, listing anomaly)
- E9.6: Moderation queue (auto-flagged + user reports)
- E9.7: Moderation action flows (takedown, warn, suspend, ban)
- E9.8: Appeal workflow
- E9.9: Anti-scraping measures

**Acceptance Criteria:** User can complete ID verification, badge appears. Ownership verification processes documents. Risk scoring flags suspicious listings. Moderation queue works with full action set. Appeals process functional.

### Epic 10: Billing & Payments (Weeks 10–16)

**Stories:**

- E10.1: Stripe integration (checkout sessions, subscriptions, webhooks)
- E10.2: Listing package purchase flow
- E10.3: Verification upgrade purchase
- E10.4: Boost purchase
- E10.5: Subscription management (landlord/provider)
- E10.6: Invoice generation
- E10.7: Refund processing
- E10.8: Marketplace take-rate calculation + provider billing

**Acceptance Criteria:** Users can purchase packages, verification, boosts. Subscriptions create/cancel/change correctly. Invoices generated. Refunds process through Stripe. Provider payouts calculate correct take-rate.

### Epic 11: Admin Console (Weeks 14–20)

**Stories:**

- E11.1: Admin authentication (MFA required, IP allowlisting)
- E11.2: Platform KPI dashboard
- E11.3: Moderation queue interface
- E11.4: User management (search, view, suspend, ban)
- E11.5: Listing management (search, view, moderate)
- E11.6: Dispute management interface
- E11.7: Jurisdiction configuration interface
- E11.8: Audit log viewer
- E11.9: Revenue + billing dashboard
- E11.10: Provider management

**Acceptance Criteria:** Admin can login with MFA, view platform KPIs, moderate content, manage users and listings, configure jurisdictions, view audit logs.

### Epic 12: SEO & Marketing System (Weeks 8–14)

**Stories:**

- E12.1: Programmatic area pages (sell in [area], rent in [area])
- E12.2: Property type guide pages
- E12.3: Schema.org markup (RealEstateListing, Place)
- E12.4: Sitemap generation (dynamic)
- E12.5: OG image generation for listings + share kit
- E12.6: Blog infrastructure
- E12.7: Analytics implementation (GA4 + product analytics)
- E12.8: Lifecycle email sequences
- E12.9: Referral system (seller-to-seller, provider-to-seller)

**Acceptance Criteria:** Area pages rank for target keywords. Listings have full schema markup. Analytics events fire for all funnel steps. Email sequences trigger correctly. Referral tracking works.

### Epic 13: Jurisdiction Plugin System (Weeks 4–8)

**Stories:**

- E13.1: Jurisdiction config schema + database table
- E13.2: Config loading middleware (per-request jurisdiction resolution)
- E13.3: UK-England configuration (full: fields, templates, milestones, partners)
- E13.4: UK-Scotland configuration
- E13.5: Tenancy agreement template engine
- E13.6: Sale milestone template engine
- E13.7: Admin interface for jurisdiction management

**Acceptance Criteria:** UK-England and UK-Scotland both work with correct required fields, milestones, templates, and compliance rules. Adding a new jurisdiction requires only config, no code changes.

---

## 7.2 Dependency Map

```
E1 (Foundation) ──→ ALL epics depend on E1
E2 (Listings) ──→ E3, E4, E5, E8, E9, E12
E3 (Messaging) ──→ E5, E6
E4 (Viewings) ──→ E5
E5 (Offers) ──→ E6
E6 (Deal Room) ──→ E7 (rental extensions reuse Deal Room)
E7 (Rental) ──→ Independent after E6 + E10
E8 (Marketplace) ──→ E10 (for payouts)
E9 (Trust) ──→ E2 (badges on listings)
E10 (Billing) ──→ E2, E8, E9
E11 (Admin) ──→ E9, E10
E12 (SEO/Marketing) ──→ E2
E13 (Jurisdiction) ──→ E2, E6, E7
```

## 7.3 Technical Debt Register

| Item | Description | Impact | Deferred Until | Remediation Plan |
|------|-------------|--------|---------------|-----------------|
| TD-01 | PG full-text search instead of dedicated search engine | Acceptable at <50k listings; degrades at scale | >50k active listings | Migrate to Algolia/OpenSearch; keep PG as source of truth, async sync |
| TD-02 | Monolithic API (Next.js API routes) | Single deploy unit; scaling limited to vertical | >100 req/s sustained | Extract hot paths (search, messaging) to NestJS microservices |
| TD-03 | No native mobile apps | Mobile web only; push notifications limited | Post-launch (6 months) | React Native or Flutter; shared API layer |
| TD-04 | Manual provider payout review | Weekly batch, manual trigger | >100 providers | Automated payout with configurable rules + exception queue |
| TD-05 | Single-region deployment | UK-only data residency | International expansion | Multi-region RDS + regional S3 buckets + edge routing |
| TD-06 | Hardcoded email templates | Template changes require deploy | Post-launch | Migrate to Postmark template editor (no-code changes) |
| TD-07 | No real-time messaging (polling) | Polling every 5s; not true real-time | Post-launch (3 months) | WebSocket via Socket.io or Ably/Pusher |
| TD-08 | Basic pricing engine | Limited comparables, simple algorithm | Post-launch (6 months) | ML-based pricing model trained on transaction data |

**Debt management:** Technical debt items are tracked in this register. Each item reviewed monthly. Remediation scheduled when trigger condition met or during planned refactoring sprints (1 week every 6 weeks).

## 7.4 "Human Inputs Required" Checklist

These are decisions, accounts, legal requirements, and external dependencies that require human action before the build can proceed.

| # | Input Required | Owner | Blocking Epic(s) | Priority |
|---|---------------|-------|-------------------|----------|
| 1 | Register company (Ltd) + business bank account | Founder | E10 (Billing) | Week 1 |
| 2 | Stripe account setup (business verification, Connect enabled) | Founder | E10 | Week 1 |
| 3 | AWS account setup (with billing alerts, IAM roles) | Founder/CTO | E1 | Week 1 |
| 4 | Vercel account (Pro plan for team) | CTO | E1 | Week 1 |
| 5 | GitHub organisation + repository setup | CTO | E1 | Week 1 |
| 6 | Clerk/Auth0 account + application setup | CTO | E1 | Week 1 |
| 7 | Onfido account + API keys | Founder | E9 | Week 4 |
| 8 | Postmark account (domain verification, DKIM/SPF) | CTO | E1 | Week 1 |
| 9 | Twilio account (phone numbers, sender ID registration) | CTO | E1 | Week 2 |
| 10 | DocuSign/Adobe Sign developer account | CTO | E6 | Week 8 |
| 11 | Land Registry API access (or data partner agreement) | Founder | E2 (Pricing) | Week 3 |
| 12 | Companies House API key | CTO | E8 (Provider verification) | Week 8 |
| 13 | ICO registration (data controller) | Founder | E1 (legal compliance) | Week 1 |
| 14 | Terms of Service + Privacy Policy drafting (solicitor) | Founder | E1 | Week 2 |
| 15 | Cookie policy + consent mechanism decision | Founder | E1 | Week 2 |
| 16 | Domain name purchase + DNS configuration | Founder | E1 | Week 1 |
| 17 | SSL certificate (auto via Vercel/AWS) | CTO | E1 | Week 1 |
| 18 | Decide referencing partner (Canopy, HomeLet, etc.) + contract | Founder | E7 | Week 10 |
| 19 | Decide deposit protection scheme integration partner | Founder | E7 | Week 10 |
| 20 | Google Ads account + budget allocation | Founder/Marketing | E12 | Week 6 |
| 21 | GA4 property setup + product analytics tool (Mixpanel/Amplitude/PostHog) | CTO | E12 | Week 4 |
| 22 | Content moderation policy document (internal) | Founder + Legal | E9 | Week 8 |
| 23 | Anti-money laundering (AML) compliance assessment (for property transactions) | Legal counsel | E9 | Week 4 |
| 24 | Rightmove/Zoopla portal partnership application (if desired) | Founder | E2 (syndication) | Week 8 |
| 25 | Insurance: professional indemnity, cyber liability, D&O | Founder | All | Week 1 |
| 26 | Sentry account + project setup | CTO | E1 | Week 1 |
| 27 | Datadog/Grafana Cloud account | CTO | E1 | Week 1 |
| 28 | Hire or contract: 2 full-stack engineers, 1 designer, 1 QA | Founder | E1 | Week 1 |
| 29 | Brand identity (logo, colour palette, typography) | Founder/Designer | E1 (design system) | Week 1 |
| 30 | Decide VAT registration threshold approach | Accountant | E10 | Week 4 |

---

## Next 25 Actions the Human Founder Must Do to Enable Execution

1. **Register the company** (Ltd or equivalent) and open a business bank account.
2. **Purchase the domain name** and configure DNS.
3. **Set up AWS account** with billing alerts and least-privilege IAM roles.
4. **Create Vercel Pro account** and link to the domain.
5. **Set up GitHub organisation**, create the monorepo, and configure branch protection rules.
6. **Register with the ICO** as a data controller (UK GDPR compliance).
7. **Engage a solicitor** to draft Terms of Service, Privacy Policy, and Cookie Policy.
8. **Set up Stripe account** with business verification; enable Stripe Connect for marketplace payouts.
9. **Set up Clerk (or Auth0) account** and configure application with RBAC roles.
10. **Set up Postmark account**, verify sending domain (DKIM + SPF + DMARC), and configure transactional templates.
11. **Set up Twilio account**, register sender ID, and purchase a phone number for SMS.
12. **Set up Sentry** and **Datadog/Grafana Cloud** accounts for observability.
13. **Sign up for Onfido** (or chosen KYC provider) and obtain API credentials.
14. **Apply for Land Registry API access** (or secure a data partnership for comparable sales data).
15. **Obtain Companies House API key** for provider business verification.
16. **Hire or contract the core team**: 2 full-stack engineers, 1 product designer, 1 QA engineer.
17. **Commission brand identity** (logo, colour palette, typography, design system foundations).
18. **Set up GA4 property** and choose a product analytics platform (PostHog recommended for self-hosted option).
19. **Draft the internal content moderation policy** (what's allowed, what's not, escalation paths).
20. **Consult legal counsel on AML compliance** requirements for facilitating property transactions.
21. **Obtain professional indemnity insurance**, cyber liability insurance, and D&O insurance.
22. **Set up Google Ads account** and allocate initial budget for launch market keywords.
23. **Identify and approach 5 service providers** (photographers, EPC assessors) in the launch area for early partnership.
24. **Identify 3–5 founding sellers** willing to list properties in exchange for free premium packages and case study permission.
25. **Create a shared project workspace** (Notion or Linear) with this execution plan loaded as epics, stories, and tasks — assign owners and set sprint cadence.

---

*End of NoAgent Complete End-State Deliverable.*

*Document version: 1.0 | Date: February 2026 | Classification: Confidential*
