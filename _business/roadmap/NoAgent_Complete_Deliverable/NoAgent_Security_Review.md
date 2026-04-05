# NoAgent — Pre-Launch Security Review

## External Auditor Assessment

**Auditor:** Independent Security Review
**Scope:** Full-stack application security assessment of the NoAgent property transaction platform
**Classification:** CONFIDENTIAL
**Date:** February 2026
**Reference Architecture:** NoAgent End-State Spec (Prompt 1) + Build Plan (Prompt 2)

---

# 1. STRIDE Threat Model

## 1.1 Methodology

Every component boundary in the NoAgent architecture has been assessed against the six STRIDE threat categories. Risk ratings follow a standard matrix: Likelihood (1–5) × Impact (1–5) = Risk Score. Scores 1–6 = Low, 7–14 = Medium, 15–19 = High, 20–25 = Critical.

## 1.2 Asset Inventory (Attack Surface)

Before modelling threats, we enumerate what attackers want:

| Asset | Classification | Location | Value to Attacker |
|-------|---------------|----------|-------------------|
| User PII (name, email, phone, address) | Confidential | PostgreSQL `users` table | Identity theft, phishing |
| Identity documents (passport, driving licence) | Highly Confidential | Onfido (third-party) + reference token in DB | Identity fraud |
| Property ownership documents (title deeds) | Confidential | S3 `noagent-documents` bucket | Ownership fraud, advance-fee scams |
| Financial documents (AIP, proof of funds) | Highly Confidential | S3 `noagent-documents` bucket | Financial fraud |
| Deal Room documents (contracts, searches, surveys) | Confidential | S3 `noagent-documents` bucket | Transaction fraud, competitive intelligence |
| Listing data (address, price, photos) | Public (when published) | PostgreSQL + S3 + CDN | Scraping for competitor databases |
| Messaging content | Confidential | PostgreSQL `messages` table | Social engineering, harassment evidence |
| Payment credentials | Highly Confidential | Stripe (never in NoAgent systems) | Financial fraud |
| Session tokens / JWTs | Confidential | Client-side (HttpOnly cookies) | Account takeover |
| Admin credentials | Highly Confidential | Clerk (auth provider) | Platform-wide compromise |
| Audit logs | Integrity-Critical | PostgreSQL `audit_logs` table | Cover tracks after breach |
| Referencing reports (credit, landlord) | Highly Confidential | Partner API + cached result in DB | Identity theft, discrimination |

## 1.3 Full STRIDE Threat Table

### S — Spoofing (Identity)

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| S-01 | Fake account registration with stolen email | Auth system | 4 | 3 | 12 Med | Email OTP verification required before any action. Rate limit registration: 3 accounts per IP per hour. | Clerk config + `rateLimit.middleware.ts` | Must have |
| S-02 | Fake account with stolen phone number | Auth system | 3 | 3 | 9 Med | SMS OTP verification. Twilio Lookup API to validate phone is real and active. One phone per account (unique constraint). | Clerk config + DB constraint | Must have |
| S-03 | Fake seller impersonating property owner | Listing creation | 5 | 5 | 25 Crit | Tiered verification: unverified listings carry prominent warning banner. Ownership Verified requires title deed upload + partner cross-reference (Land Registry API). Enhanced Verified adds in-person or video verification. | `verification.router.ts` + Onfido integration + Land Registry API | Must have |
| S-04 | Account takeover via credential stuffing | Auth system | 4 | 5 | 20 Crit | Clerk's built-in brute-force protection (lockout after 5 failed attempts). MFA required for: password change, email change, bank detail change, offer acceptance, deal room document access. Device trust scoring. | Clerk config + `auth.middleware.ts` | Must have |
| S-05 | Provider impersonating legitimate business | Service marketplace | 3 | 4 | 12 Med | Companies House API verification of registration number. Manual portfolio review for first 3 providers in each area. Business address verification via postcard/SMS code. | `marketplace.router.ts` + admin review queue | Must have |
| S-06 | Buyer impersonating verified buyer with fake AIP | Offer system | 3 | 3 | 9 Med | AIP document upload is labelled "self-declared" unless verified by mortgage broker partner. Sellers shown clear distinction between "AIP uploaded" vs "AIP verified." | `offer.service.ts` + UI labels | Should have |
| S-07 | Session token theft via XSS | Client-side | 2 | 5 | 10 Med | HttpOnly + Secure + SameSite=Lax cookies. Strict CSP with nonce-based inline scripts. No eval(). DOM sanitization on all user-generated content (DOMPurify). | `next.config.ts` headers + CSP middleware | Must have |
| S-08 | OAuth/social login hijack | Auth system | 2 | 4 | 8 Med | PKCE flow for all OAuth providers. State parameter validation. Clerk handles this natively. | Clerk config | Must have |

### T — Tampering (Data Integrity)

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| T-01 | Seller modifies listing price after buyer makes offer | Listings | 3 | 4 | 12 Med | Listing price at time of offer captured in `offers.listing_price_at_submission` (immutable snapshot). Price change after active offer triggers notification to all offer holders. Audit log on every price change. | `offer.service.ts` + `listing.service.ts` | Must have |
| T-02 | Offer amount tampered in transit | Offers | 2 | 5 | 10 Med | All API calls over TLS 1.2+. Offer data validated server-side against Zod schema. Offer records are append-only (no UPDATE on amount; amendments create new version with `parent_offer_id`). | `offer.router.ts` + DB design | Must have |
| T-03 | Document replaced in Deal Room after upload | Deal Room | 3 | 5 | 15 High | SHA-256 integrity hash computed on upload, stored in `deal_room_documents.integrity_hash`. On download, hash is recomputed and compared. Version history maintained — old versions never deleted. All uploads and downloads audit-logged. | `dealRoom.service.ts` + S3 versioning | Must have |
| T-04 | Audit log entries modified to cover tracks | Audit system | 2 | 5 | 10 Med | `audit_logs` table: application DB role has INSERT-only permission (no UPDATE, no DELETE). Separate DB role for reads (admin console). Table is partitioned by month. Consider shipping critical audit events to an external immutable store (e.g., S3 append-only bucket with Object Lock). | DB role config + Terraform IAM | Must have |
| T-05 | API request parameter manipulation (mass assignment) | All endpoints | 3 | 4 | 12 Med | Strict Zod input validation on every tRPC procedure. No spread of raw input into DB queries. Explicit field allowlists per mutation. | `validators/*.schema.ts` + router input definitions | Must have |
| T-06 | Image metadata injection (EXIF contains scripts/PII) | Media uploads | 3 | 3 | 9 Med | All uploaded images processed through Sharp: EXIF stripped, resized, re-encoded. Original never served to clients. Video processed through FFmpeg with metadata stripping. | `media.processor.ts` | Must have |
| T-07 | Webhook payload forgery (Stripe, Onfido, Clerk) | Webhook endpoints | 3 | 5 | 15 High | Every webhook endpoint verifies signature using provider's SDK (Stripe: `stripe.webhooks.constructEvent()`, Onfido: HMAC verification, Clerk: `svix` library). Replay protection via timestamp check (reject if >5 min old). Webhook secrets stored in Secrets Manager, never in code. | `webhooks/*.ts` | Must have |

### I — Information Disclosure

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| I-01 | Buyer sees seller's personal contact details before seller consents | Messaging | 4 | 3 | 12 Med | All communications through masked relay (email proxy via Postmark inbound routing, phone proxy via Twilio). Real contact details never exposed in API responses to counterparty. De-masking only when both parties explicitly opt in (post-offer acceptance). | `message.service.ts` + Postmark inbound + Twilio proxy | Must have |
| I-02 | Enumeration of user emails/phone via auth endpoints | Auth system | 3 | 3 | 9 Med | Registration and login return identical generic messages regardless of whether account exists ("If an account exists, we've sent a verification code"). Rate limit auth endpoints: 10 req/min per IP. | Clerk config (generic error messages) + rate limiter | Must have |
| I-03 | Deal Room documents accessible to uninvited parties | Deal Room | 3 | 5 | 15 High | S3 objects are private. Access only via CloudFront signed URLs generated per-user, per-document, with 15-minute expiry. Signed URL generation checks `deal_room_stakeholders` ACL + `deal_room_documents.access_roles`. Every signed URL generation is audit-logged. | `dealRoom.service.ts` + CloudFront key pair | Must have |
| I-04 | Referencing report data leaked to unauthorised party | Rental applications | 2 | 5 | 10 Med | Referencing results stored encrypted at rest (AES-256 via RDS encryption). Application-level access: only landlord (owner), the tenant themselves, and admin can view. Never included in API list responses — only on explicit detail fetch with ACL check. | `application.router.ts` + RBAC | Must have |
| I-05 | Verbose error messages expose internal details | All endpoints | 3 | 2 | 6 Low | Production error handler returns generic messages with error code only. Stack traces, SQL errors, internal paths only in dev/staging. Sentry captures full details server-side. | tRPC error formatter + `NODE_ENV` check | Must have |
| I-06 | PII in application logs | Logging infrastructure | 3 | 4 | 12 Med | Pino logger configured with `redact` paths: email, phone, password, token, authorization headers, document content. Log review in first sprint to verify no leaks. | `logger.ts` redact config | Must have |
| I-07 | Search engine indexes private listing data | Public web | 2 | 2 | 4 Low | `robots.txt` blocks `/dashboard/`, `/deals/`, `/admin/`. Private pages return `X-Robots-Tag: noindex`. Draft listings return 404 for non-owners. | `next.config.ts` headers + route middleware | Must have |
| I-08 | S3 bucket misconfiguration exposing private documents | File storage | 2 | 5 | 10 Med | All S3 buckets: `BlockPublicAccess: true`. Media bucket: CloudFront OAI only. Documents bucket: no public access, signed URLs only. Terraform enforces these settings — manual changes detected by drift detection. | `infra/terraform/modules/s3/` | Must have |

### D — Denial of Service

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| D-01 | Enquiry spam overwhelming seller inbox | Messaging | 4 | 3 | 12 Med | Rate limits: 10 enquiries/buyer/day across platform. 50 enquiries/listing/day. CAPTCHA on enquiry form after 3rd enquiry in session. Spam classifier (Bayesian + heuristic: bulk identical messages, external links, phone numbers in first message). | `rateLimit.middleware.ts` + `enquiry.router.ts` | Must have |
| D-02 | Viewing booking abuse (bulk-book then no-show) | Viewing scheduler | 3 | 3 | 9 Med | Max 5 active viewing bookings per buyer. 24-hour confirmation required (unconfirmed bookings auto-cancelled). No-show strike system (3 strikes → booking restricted). Optional refundable deposit per booking (jurisdiction-configurable). | `viewing.service.ts` | Must have |
| D-03 | API flood / DDoS | All endpoints | 3 | 4 | 12 Med | Vercel Edge: built-in DDoS protection. Redis-backed rate limiting: 100 req/min authenticated, 30 req/min unauthenticated per IP. Cloudflare or AWS WAF in front of Vercel (Phase 2). | `rateLimit.middleware.ts` + Vercel Edge config | Must have |
| D-04 | Large file upload abuse (exhaust storage) | Media upload | 3 | 3 | 9 Med | Presigned URL with max content-length: 50MB images, 200MB video, 20MB documents. Max 20 media items per listing. Total storage quota per user: 2GB (configurable). Oversized uploads rejected at S3 level (presigned URL policy). | `media.service.ts` + S3 presigned URL conditions | Must have |
| D-05 | Search query abuse (expensive PostGIS queries) | Search | 3 | 3 | 9 Med | Search rate limit: 60 req/min per user. Query complexity cap: max radius 50km, max results 50 per page. Listing search responses cached in Redis (60-second TTL for identical query). | `listing.router.ts` + Redis cache | Should have |
| D-06 | Account creation abuse (bot registration) | Auth system | 4 | 2 | 8 Med | CAPTCHA on registration (hCaptcha or Cloudflare Turnstile — not Google reCAPTCHA, to avoid Google data sharing). Device fingerprinting to detect headless browsers. Registration rate limit: 3 per IP per hour. | Clerk config + CAPTCHA widget | Must have |
| D-07 | Listing creation spam (thousands of fake listings) | Listings | 3 | 4 | 12 Med | Unverified users: max 2 active listings. ID Verified: max 5. Ownership Verified: max 10. Portfolio Landlord: configurable (default 50). Risk scoring on listing creation (see F-05). | `listing.service.ts` + jurisdiction config | Must have |

### E — Elevation of Privilege

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| E-01 | Buyer accesses seller's enquiry dashboard via IDOR | Enquiries | 4 | 3 | 12 Med | Every data-fetching endpoint checks resource ownership. Enquiry list requires `listing.ownerId === currentUser.id` or delegate relationship. No sequential/guessable IDs (UUIDs throughout). | `requireAccess()` middleware + UUID PKs | Must have |
| E-02 | Regular user accesses admin endpoints | Admin console | 2 | 5 | 10 Med | Admin console is a separate Next.js app on a separate subdomain (`admin.noagent.com`). RBAC middleware requires `ADMIN` or `TRUST_SAFETY` role. Admin subdomain restricted to allowlisted IP ranges (office + VPN). MFA mandatory for all admin accounts (enforced by Clerk). | Separate app + `adminProcedure` + Clerk MFA policy + network config | Must have |
| E-03 | Delegate escalates own permissions beyond granted scope | Delegation system | 3 | 3 | 9 Med | Delegate permissions stored as explicit JSON allowlist in `delegates.permissions`. Permission check compares requested action against allowlist — deny by default. Delegator receives notification when delegate performs sensitive actions. | `requireAccess()` + `delegates` table | Must have |
| E-04 | Service provider accesses deal room they weren't invited to | Deal Room | 2 | 4 | 8 Med | Deal Room access requires entry in `deal_room_stakeholders` table for the current user. Provider can only access deal rooms where they have an active, accepted stakeholder record. | `dealRoom.router.ts` + `requireAccess()` | Must have |
| E-05 | JWT manipulation (change role claim) | Auth system | 1 | 5 | 5 Low | JWTs issued by Clerk (RS256 signed). Server verifies signature on every request using Clerk's public key. Role information fetched from database (not trusted from JWT claims alone) — JWT is only used for identity, DB is source of truth for permissions. | `isAuthenticated` middleware: DB lookup after JWT verify | Must have |
| E-06 | Mass assignment to escalate verification tier | User profiles | 2 | 4 | 8 Med | `verificationTier` field is not updatable via user profile endpoint. Only updated by verification webhook handler (Onfido callback) or admin action. Zod input schemas for profile updates explicitly exclude `verificationTier`, `roles`, `status`. | Zod schema allowlisting + separate verification flow | Must have |

### R — Repudiation

| ID | Threat | Target | L | I | Risk | Mitigation | Implementation Point | Status |
|----|--------|--------|---|---|------|-----------|---------------------|--------|
| R-01 | Seller denies receiving/accepting offer | Offers | 3 | 4 | 12 Med | All offer actions (submit, view, counter, accept, reject) are immutable audit-logged with timestamp, user_id, IP, user_agent. Offer status changes trigger email + in-app notification to both parties with timestamped receipt. | `audit.middleware.ts` + `offer.service.ts` | Must have |
| R-02 | Provider denies job was late / incomplete | Marketplace | 3 | 3 | 9 Med | Job timeline (created, accepted, scheduled, delivered, completed, disputed) fully logged. Delivery timestamp captured automatically when provider uploads assets. SLA clock computed from these immutable timestamps. | `service_jobs` table + audit log | Must have |
| R-03 | Landlord denies rejecting application for discriminatory reasons | Rental applications | 3 | 5 | 15 High | Rejection requires structured reason code (selected from predefined list aligned with Equality Act 2010). Free-text rejection notes stored but not shown to tenant. All decisions audit-logged. Annual compliance report generated showing rejection reason distribution by landlord — anomalies flagged for T&S review. | `application.router.ts` + compliance reporting job | Must have |
| R-04 | User disputes they sent a message / made a statement | Messaging | 2 | 3 | 6 Low | All messages immutable (no edit, no delete by user). Messages stored with sender_id, timestamp, IP. Users can request T&S to review a message thread but cannot unilaterally remove messages. | `messages` table design (no UPDATE/DELETE in application layer) | Must have |
| R-05 | Fake reviews (provider creates fake positive reviews) | Reviews | 4 | 3 | 12 Med | Reviews gated: reviewer must have a completed transaction (service job or deal) with the reviewee. One review per transaction. Anomaly detection: multiple positive reviews from accounts with similar registration patterns (IP, device, timing). Both parties must submit before either review is visible (prevents retaliation). | `review.service.ts` + anomaly detection job | Must have |

---

# 2. OWASP Top 10 Checklist (2021)

## Detailed Controls & Implementation Map

### A01:2021 — Broken Access Control

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Deny by default | tRPC procedures default to `publicProcedure` (read-only); all mutations require `authedProcedure` or higher. No endpoint is accidentally unprotected — router compilation fails if middleware chain incomplete. | `trpc.ts` procedure builders | Unit test: every router mutation uses authed+ procedure |
| RBAC on every endpoint | Three-layer middleware: `isAuthenticated` → `requireRole()` → `requireAccess()`. Role checked against DB, not JWT claims. | `auth.middleware.ts`, `rbac.middleware.ts` | Integration tests: test each endpoint with wrong role → 403 |
| Resource-level ownership checks | `requireAccess()` middleware with per-resource check function. Listing endpoints verify `ownerId`. Deal Room endpoints verify `stakeholders` membership. Enquiry endpoints verify listing ownership. | Per-router `requireAccess` definitions | Integration tests: user A cannot access user B's resources |
| UUID primary keys (no IDOR) | All entities use UUID v4 PKs. No sequential integers exposed in URLs or API responses. | `schema.prisma` — `@default(dbgenerated("uuid_generate_v4()"))` | Schema review |
| CORS strict origin | `Access-Control-Allow-Origin` set to exact domain (no wildcard). Credentials mode enabled only for same-origin. | `next.config.ts` headers | Security scan (ZAP) |
| Rate limiting | Redis-backed per-user and per-IP rate limits. Different tiers: public (30/min), authenticated (100/min), sensitive actions (10/min). | `rateLimit.middleware.ts` | Load test + manual verification |
| Directory traversal prevention | File paths never constructed from user input. S3 keys generated server-side with UUIDs. Presigned URLs scoped to specific keys. | `media.service.ts` | SAST scan |

### A02:2021 — Cryptographic Failures

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| TLS everywhere | Vercel enforces HTTPS (auto-redirect). HSTS header with max-age=31536000 + includeSubdomains. RDS encrypted in transit (require SSL). Redis encrypted in transit (ElastiCache TLS). | `next.config.ts` headers + Terraform config | SSL Labs scan: A+ target |
| Encryption at rest | RDS: AES-256 encryption (AWS managed key). S3: SSE-S3 (AES-256) default encryption on all buckets. Redis: at-rest encryption enabled (ElastiCache). | `infra/terraform/modules/` | AWS config audit |
| No secrets in code | All secrets in environment variables. `.env` in `.gitignore`. Secrets loaded from AWS Secrets Manager in production. TruffleHog scans in CI. | `.github/workflows/ci.yml` secrets scan step | CI gate: TruffleHog must pass |
| Password handling | Delegated to Clerk. NoAgent never stores, processes, or sees passwords. Clerk uses bcrypt with minimum 10 rounds. | Clerk configuration | Clerk SOC 2 compliance |
| Sensitive data classification | Referencing reports, identity documents, and financial documents marked as `Highly Confidential` in metadata. These fields are encrypted at application level (AES-256-GCM) in addition to disk encryption. Encryption key in Secrets Manager, rotated annually. | `encryption.util.ts` + `application.service.ts` | Key rotation runbook test |
| No sensitive data in URLs | API uses POST for all mutations. No PII in query parameters. S3 presigned URLs contain only opaque keys + signature. Referrer-Policy set to `strict-origin-when-cross-origin`. | `next.config.ts` headers + tRPC (POST by default) | ZAP scan |

### A03:2021 — Injection

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| SQL injection prevention | Prisma ORM: all queries parameterised. No raw SQL in application code except explicitly reviewed `$queryRaw` with tagged templates (parameterised). Prisma rejects string interpolation in raw queries at compile time. | All `*.service.ts` files | SAST scan + code review policy |
| XSS prevention | React's default JSX escaping. DOMPurify on any dangerously-set HTML (listing descriptions rendered from rich text). CSP with `script-src 'self' 'nonce-{random}'`. No `eval()`, no `innerHTML` without sanitization. | `next.config.ts` CSP + `sanitize.util.ts` | ZAP DAST scan + manual test |
| Command injection prevention | No shell commands in application code. Media processing via Sharp/FFmpeg libraries (not CLI). Worker job payloads are typed objects, never interpolated into commands. | `media.processor.ts` | Code review |
| NoSQL injection | Not applicable (PostgreSQL only, no NoSQL databases). | — | — |
| LDAP/OS injection | Not applicable (no LDAP, no OS command execution). | — | — |
| Content-Type validation | All API endpoints expect `application/json`. File uploads use presigned URLs with `Content-Type` conditions. `X-Content-Type-Options: nosniff` header. | `next.config.ts` headers + S3 presigned URL conditions | Security scan |

### A04:2021 — Insecure Design

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Threat modelling | This document. Updated on every major feature addition. | `docs/security/threat-model.md` | Quarterly review |
| Abuse case testing | E2E tests include abuse scenarios: wrong-role access, rate limit breach, IDOR attempts, invalid input. | `__tests__/e2e/security/` | CI E2E suite |
| Business logic validation | Offers cannot exceed 10× asking price (likely fat-finger). Viewing cannot be booked in the past. Listing cannot be published without minimum media. Deposit amount cannot exceed jurisdiction cap. | `validators/*.schema.ts` + service-level checks | Unit tests on business rules |
| Rate limiting by design | Every endpoint has a rate limit category assigned in the middleware chain. Limits are configurable per jurisdiction. | `rateLimit.middleware.ts` config | Rate limit integration tests |
| Fail securely | On any unhandled error, system returns generic 500 (no data leak). Auth failures return 401 (no user enumeration). Permission failures return 403 (no resource existence leak). | tRPC error formatter | Manual testing + ZAP |

### A05:2021 — Security Misconfiguration

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Security headers | HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy (disable camera, microphone, geolocation unless needed), CSP. | `next.config.ts` `headers()` function | securityheaders.com scan: A+ target |
| No default credentials | All service accounts use generated passwords stored in Secrets Manager. Default accounts disabled. Database user has minimum required permissions (no superuser). | `infra/terraform/` + setup runbook | Infrastructure review |
| Debug mode disabled in production | `NODE_ENV=production` enforced in Vercel. Prisma query logging disabled. Swagger UI disabled. Source maps uploaded to Sentry but not served to clients. | Vercel environment config | Deployment checklist |
| Unnecessary features disabled | PostgreSQL: only required extensions enabled (PostGIS, pg_trgm, uuid-ossp). No unnecessary ports open. AWS security groups: minimum required ingress. | Terraform security group definitions | AWS config audit |
| Automated configuration scanning | AWS Config rules for S3 bucket public access, RDS encryption, security group audit. Terraform plan diff reviewed in PR. | `infra/terraform/` + AWS Config | CI: `terraform plan` in PR |

### A06:2021 — Vulnerable and Outdated Components

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Dependency scanning | Snyk Open Source in CI — blocks PR on critical/high vulnerabilities. `pnpm audit` as additional check. | `.github/workflows/ci.yml` security job | CI gate: must pass |
| Automated updates | Dependabot configured: weekly PRs for security updates (auto-merge patch, manual review minor/major). Renovate as alternative. | `.github/dependabot.yml` | Dependabot PR activity |
| Component inventory | `pnpm list --depth=0` output maintained. License compliance check (`license-checker`). | CI check + quarterly review | License audit |
| Container scanning | Worker Docker images scanned with Trivy in CI. Base images pinned to specific digests (not `latest`). | `.github/workflows/ci.yml` + `Dockerfile.workers` | CI gate |
| Runtime patching | Security patch window: critical = 24 hours, high = 7 days, medium = 30 days. Tracked in security register. | `docs/security/security-policy.md` | Patch cadence review |

### A07:2021 — Identification and Authentication Failures

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Brute-force protection | Clerk: account lockout after 5 failed attempts (configurable). Progressive delay. CAPTCHA triggered after 3 failures. | Clerk dashboard config | Manual test: attempt 6+ logins |
| MFA | Available for all users. Required for: admin accounts, sensitive actions (offer acceptance, deal room document access, bank detail changes, password/email changes). | Clerk MFA config + `auth.middleware.ts` step-up auth | E2E test: sensitive action without MFA → blocked |
| Session management | JWT expiry: 15 minutes. Refresh token: 7 days (rotated on use). Session revocation on password change. Concurrent session limit: 5 devices. | Clerk session config | Session test suite |
| Password policy | Minimum 10 characters, no common password list, breach detection (Clerk checks HaveIBeenPwned). | Clerk password policy | Registration test |
| Credential recovery | Reset via email OTP only. Link expires in 15 minutes. Single-use. | Clerk config | Manual test |

### A08:2021 — Software and Data Integrity Failures

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| CI/CD pipeline integrity | GitHub Actions: environments require reviewer approval for production. Branch protection: require PR reviews, require status checks, no force push to main. Deployment via Vercel (signed deploys) or ECS (image digest pinning). | `.github/` branch protection rules | GitHub settings audit |
| Dependency lockfile | `pnpm-lock.yaml` committed and verified. `pnpm install --frozen-lockfile` in CI (fails if lockfile out of sync). | `.github/workflows/ci.yml` | CI: frozen-lockfile flag |
| Webhook signature verification | All inbound webhooks (Stripe, Onfido, Clerk) verify cryptographic signature before processing. Replay protection via timestamp check. | `webhooks/*.ts` | Integration tests with forged payloads |
| Subresource integrity | External CDN resources loaded with SRI hashes. Limited external resources — most code is first-party. | `next.config.ts` CSP + SRI attributes | Manual review |
| Signed URLs for file access | All S3 file access via CloudFront signed URLs with expiry. No direct S3 access. Signed URL policy: max 15-minute validity. | `media.service.ts` + `dealRoom.service.ts` | Integration test: expired URL returns 403 |

### A09:2021 — Security Logging and Monitoring Failures

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| Comprehensive audit logging | See Section 4 below for full event list. Every sensitive action logged with user, timestamp, IP, target. | `audit.middleware.ts` + `audit_logs` table | Audit log coverage test |
| Log integrity | Audit log table: INSERT-only permissions for app role. No UPDATE or DELETE. Partitioned by month. Consider external immutable store (S3 Object Lock). | DB role config + partition strategy | Permission test: attempt UPDATE → denied |
| Real-time alerting | Sentry alerts on error rate spike. Datadog monitors on: 5xx rate, auth failure rate, rate limit trigger rate, moderation queue depth. PagerDuty integration for SEV1/2. | Datadog monitors + PagerDuty config | Alert dry-run test |
| Log retention | Application logs: 90 days (Datadog). Audit logs: 7 years (PostgreSQL, partitioned + archived to S3 after 1 year). Security events: 7 years. | Log pipeline config + archival cron | Retention policy test |
| Anti-tampering | Critical security events (login, password change, role change, ban, data export) also written to a separate `security_events` table with application-level HMAC signature using a key not accessible to the main application DB role. | `securityEvent.service.ts` | HMAC verification test |

### A10:2021 — Server-Side Request Forgery (SSRF)

| Control | Implementation | File/Module | Verified By |
|---------|---------------|-------------|-------------|
| No user-controlled URLs in server-side requests | Server never fetches user-provided URLs. All external API calls go to hardcoded partner endpoints (Stripe, Onfido, Postmark, Twilio, Land Registry). | Code review policy | SAST scan for `fetch`/`axios` with dynamic URLs |
| Metadata endpoint blocking | AWS metadata endpoint (169.254.169.254) blocked in security groups for ECS tasks. Environment variables used instead of instance metadata. | Terraform security groups + ECS task role | Network test |
| DNS rebinding protection | Not applicable (no user-controlled URL fetching). | — | — |
| Allowlisted outbound | Egress security groups restrict outbound to: HTTPS (443) to specific partner domains. No arbitrary outbound connections from workers. | Terraform security groups | Network audit |

---

# 3. Property Marketplace Abuse & Fraud Scenarios

These are domain-specific threats beyond generic web application security.

## 3.1 Listing Fraud

### F-01: Phantom Listing (Fake Property)

**Scenario:** Attacker creates a listing for a property they don't own to collect advance fees from buyers ("Pay a holding deposit to secure the property").

**Risk:** Critical — direct financial harm to buyers, severe reputational damage to platform.

**Detection signals:**
- Unverified seller creating listing at high-value price point
- Listing photos reverse-image-search match existing portal listings
- Address doesn't match any registered title at Land Registry
- Multiple reports from viewers ("Property doesn't exist" / "Someone else lives there")

**Mitigations:**
- Unverified listings display prominent banner: "This seller has not verified ownership. Exercise caution."
- Image hash comparison against existing listings database (perceptual hash, e.g., pHash/dHash) to detect re-used photos
- For listings above configurable price threshold (e.g., £500,000), require at minimum ID verification before publish
- Land Registry cross-reference for Ownership Verified tier
- Platform explicitly prohibits sellers from requesting direct payments — all payments route through regulated partners
- In-platform messaging scans for payment-related keywords and flags them ("Send money to", "Western Union", "bank transfer directly", "holding deposit to me")

### F-02: Shill Bidding / Fake Offers

**Scenario:** Seller creates secondary accounts to submit fake offers, inflating the perceived demand for their property to pressure genuine buyers into bidding higher.

**Risk:** High — market manipulation, buyer financial harm.

**Detection signals:**
- Offers from accounts with same IP, device fingerprint, or creation timestamp as seller
- Offers from accounts with no other activity (no searches, no other enquiries)
- Rapid offer escalation pattern (each offer exactly 1–2% above the last, submitted within minutes)

**Mitigations:**
- Cross-reference offer submitter's device fingerprint + IP with listing owner's
- Flag offers from accounts created within 7 days of listing publication
- Offer pattern anomaly detection: rapid sequential escalation from thin accounts
- T&S investigation trigger: if 3+ offers on a listing are flagged, listing enters manual review
- Seller sees "verified" badge on each offer — indicating whether buyer has been independently verified

### F-03: Dual Listing / Double Sale

**Scenario:** Seller lists the same property on NoAgent and sells to two different buyers simultaneously.

**Risk:** High — legal dispute, buyer financial harm.

**Mitigations:**
- Address de-duplication on listing creation (same address cannot have two active listings of same type)
- Land Registry integration to check recent transactions against listed properties
- Deal Room milestone tracking includes "solicitor confirms no prior sale" checkpoint
- "Under Offer" status clearly communicated to all enquirers with timestamp

### F-04: Advance Fee Fraud (Rental)

**Scenario:** Fake landlord lists a rental property at below-market rate to attract large volumes of applications, then requests "application fees" or "holding deposits" paid directly to them before referencing is complete.

**Risk:** Critical — high volume of victims possible.

**Detection signals:**
- Rent significantly below market average for area (>25% below)
- Unverified landlord with new account
- Multiple tenant reports of direct payment requests
- Landlord messaging contains payment instruction patterns

**Mitigations:**
- Below-market rent triggers "price anomaly" warning on listing (visible to tenants)
- All deposit/fee collection must go through platform's regulated payment partner — no mechanism for landlord to collect payments outside platform
- Message scanning for payment instruction patterns (bank details, PayPal links, etc.)
- Tenant-facing education: "Never pay a deposit or fee directly to a landlord outside of NoAgent"
- Referencing fees (if any) charged by the referencing partner through the platform, never by the landlord

### F-05: Account Farming

**Scenario:** Attacker creates many accounts to operate as a fake reviews ring, enquiry spammer, or to circumvent listing limits.

**Risk:** Medium — platform integrity, trust erosion.

**Detection signals:**
- Multiple accounts from same IP/device/browser fingerprint
- Accounts created in rapid succession
- Accounts with identical or similar email patterns (john1@, john2@, john3@)

**Mitigations:**
- Device fingerprinting (FingerprintJS or similar) — flag accounts from same device
- Phone number required for any transactional action (unique constraint)
- Graph analysis: accounts linked by IP/device/email pattern clustered and flagged
- New accounts in a cluster auto-restricted until verified

### F-06: Viewing Robbery / Physical Safety

**Scenario:** Attacker books a viewing at a property to scope it for robbery, or uses a fake listing to lure people to a location.

**Risk:** High — physical safety risk.

**Mitigations:**
- Viewing booking requires verified account (at minimum email + phone verified)
- Seller can require ID verification before viewing booking
- Platform guidance: "Never conduct viewings alone. Tell someone where you're going."
- Post-viewing feedback includes safety concern flag — triggers immediate T&S review
- Viewing addresses not shown until booking is confirmed (prevent address harvesting)
- Open house format recommended for unverified buyers (multiple attendees)

## 3.2 Data Exploitation

### F-07: Systematic Data Scraping

**Scenario:** Competitor or data broker scrapes all listing data (prices, addresses, photos) for commercial use.

**Risk:** Medium — competitive disadvantage, data protection concerns.

**Mitigations:**
- Rate limiting on search API (60 req/min, 1000/hour per user)
- Unauthenticated users: stricter limits (20 req/min) + CAPTCHA after 50 results
- Bot detection: headless browser detection (Chrome DevTools protocol check, WebDriver flag)
- Geo-dispersion detection: flag users searching in unrealistic geographic patterns
- `robots.txt` with crawl-delay and specific disallows
- Terms of Service: explicit prohibition on automated data collection
- Honeypot listings (invisible to real users, trigger alert on access)

### F-08: PII Harvesting via Messaging

**Scenario:** Attacker sends enquiries to multiple sellers attempting to elicit personal information (real phone number, email, address) through conversation.

**Risk:** Medium — PII leakage.

**Mitigations:**
- All messaging through platform relay (masked by default)
- First 3 messages: external links blocked, phone number patterns redacted with warning
- If a message contains what appears to be a phone number or email address, system warns: "For your safety, share contact details only after verifying the other party"
- Bulk enquiry pattern detection (same message to 10+ listings → spam flag)

---

# 4. Immutable Audit Log Requirements

## 4.1 Events That MUST Be Logged (Immutable)

These events are legally, regulatorily, or operationally essential and must be captured in the append-only `audit_logs` table.

### Authentication & Account Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `auth.register` | user_id, email, ip, user_agent, method (email/social) | 7 years |
| `auth.login` | user_id, ip, user_agent, mfa_used, success | 7 years |
| `auth.login_failed` | attempted_email, ip, user_agent, failure_reason | 7 years |
| `auth.password_changed` | user_id, ip | 7 years |
| `auth.email_changed` | user_id, old_email_hash, new_email_hash, ip | 7 years |
| `auth.mfa_enabled` | user_id, method | 7 years |
| `auth.mfa_disabled` | user_id, ip | 7 years |
| `auth.session_revoked` | user_id, reason | 7 years |
| `auth.account_deleted` | user_id, deletion_type (self/admin) | 7 years |

### Listing Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `listing.created` | listing_id, owner_id, type | 7 years |
| `listing.published` | listing_id, owner_id, price, verification_tier | 7 years |
| `listing.price_changed` | listing_id, old_price, new_price, changed_by | 7 years |
| `listing.status_changed` | listing_id, old_status, new_status, changed_by, reason | 7 years |
| `listing.withdrawn` | listing_id, reason, withdrawn_by | 7 years |
| `listing.moderated` | listing_id, action (takedown/reinstate), reason_code, actioned_by | 7 years |

### Offer & Transaction Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `offer.submitted` | offer_id, listing_id, buyer_id, amount, conditions | 7 years |
| `offer.viewed` | offer_id, viewed_by | 7 years |
| `offer.countered` | offer_id, parent_offer_id, new_amount, countered_by | 7 years |
| `offer.accepted` | offer_id, accepted_by, final_amount | 7 years |
| `offer.rejected` | offer_id, rejected_by, reason | 7 years |
| `offer.withdrawn` | offer_id, withdrawn_by | 7 years |
| `deal_room.created` | deal_room_id, listing_id, offer_id, type | 7 years |
| `deal_room.milestone_updated` | deal_room_id, milestone_id, new_status, updated_by | 7 years |
| `deal_room.stakeholder_invited` | deal_room_id, invitee_email, role, invited_by | 7 years |
| `deal_room.stakeholder_removed` | deal_room_id, removed_user_id, removed_by | 7 years |
| `deal_room.completed` | deal_room_id, completion_date, final_price | 7 years |

### Document Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `document.uploaded` | document_id, deal_room_id, uploaded_by, filename, integrity_hash, file_size | 7 years |
| `document.downloaded` | document_id, downloaded_by, ip | 7 years |
| `document.access_granted` | document_id, granted_to, granted_by | 7 years |
| `document.access_revoked` | document_id, revoked_from, revoked_by | 7 years |
| `document.signed` | document_id, signed_by, signature_provider, signature_id | 7 years |

### Financial Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `payment.initiated` | transaction_id, user_id, amount, currency, type | 7 years |
| `payment.succeeded` | transaction_id, stripe_payment_id | 7 years |
| `payment.failed` | transaction_id, failure_reason | 7 years |
| `payment.refunded` | transaction_id, refund_amount, reason, refunded_by | 7 years |
| `payout.processed` | payout_id, provider_id, amount, stripe_transfer_id | 7 years |

### Rental-Specific Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `application.submitted` | application_id, listing_id, tenant_id | 7 years |
| `application.referencing_started` | application_id, referencing_partner | 7 years |
| `application.referencing_completed` | application_id, outcome | 7 years |
| `application.accepted` | application_id, accepted_by | 7 years |
| `application.rejected` | application_id, rejected_by, reason_code | 7 years |
| `tenancy.agreement_signed` | deal_room_id, signed_by, agreement_version | 7 years |
| `deposit.collected` | deal_room_id, amount, payment_partner | 7 years |
| `deposit.protected` | deal_room_id, scheme_name, certificate_id | 7 years |

### Moderation & Trust Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `moderation.auto_flagged` | target_type, target_id, flag_reason, risk_score | 7 years |
| `moderation.user_reported` | reporter_id, target_type, target_id, category | 7 years |
| `moderation.action_taken` | target_type, target_id, action (warn/suspend/ban/takedown), actioned_by, reason_code | 7 years |
| `moderation.appeal_submitted` | target_type, target_id, appeal_text, appealer_id | 7 years |
| `moderation.appeal_resolved` | target_type, target_id, outcome (upheld/overturned), resolved_by | 7 years |
| `user.suspended` | user_id, reason, suspended_by, duration | 7 years |
| `user.banned` | user_id, reason, banned_by | 7 years |
| `user.reinstated` | user_id, reinstated_by | 7 years |

### Verification Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `verification.identity_started` | user_id, provider (onfido) | 7 years |
| `verification.identity_completed` | user_id, outcome (pass/fail), provider_check_id | 7 years |
| `verification.ownership_started` | user_id, listing_id | 7 years |
| `verification.ownership_completed` | user_id, listing_id, outcome, method | 7 years |
| `verification.tier_changed` | user_id, old_tier, new_tier, changed_by (system/admin) | 7 years |

### Admin Events

| Event | Fields Captured | Retention |
|-------|----------------|-----------|
| `admin.login` | admin_user_id, ip, user_agent | 7 years |
| `admin.config_changed` | config_key, old_value_hash, new_value_hash, changed_by | 7 years |
| `admin.user_data_exported` | target_user_id, exported_by, export_reason | 7 years |
| `admin.user_data_deleted` | target_user_id, deleted_by, deletion_scope | 7 years |

## 4.2 Audit Log Storage Architecture

```
Application writes → audit_logs (PostgreSQL, INSERT-only role)
        │
        ├── Hot storage: PostgreSQL (last 12 months)
        │   └── Partitioned by month
        │   └── Indexed on: user_id, action, target_type+target_id, created_at
        │
        ├── Warm archival: Monthly partition → pg_dump → compressed → S3
        │   └── S3 bucket with Object Lock (COMPLIANCE mode, 7-year retention)
        │   └── Lifecycle: IA after 90 days, Glacier after 365 days
        │
        └── Critical events mirror: security_events table
            └── HMAC-signed (SHA-256) using key in Secrets Manager
            └── Separate DB role (cannot be read by application)
            └── Monitored: any gap in sequence triggers alert
```

---

# 5. Security Testing Plan & CI Gates

## 5.1 Security Testing Matrix

| Test Type | Tool | Frequency | Gate? | Threshold |
|-----------|------|-----------|-------|-----------|
| Static Analysis (SAST) | Snyk Code | Every PR | Yes | Zero critical, zero high |
| Dependency Scanning (SCA) | Snyk Open Source + `pnpm audit` | Every PR | Yes | Zero critical |
| Secrets Detection | TruffleHog | Every PR | Yes | Zero verified findings |
| Container Scanning | Trivy | Every worker image build | Yes | Zero critical, zero high |
| Dynamic Analysis (DAST) | OWASP ZAP (baseline scan) | Weekly (staging) + pre-release | No (advisory) | Zero critical (blocking), high reviewed manually |
| Penetration Testing | External firm | Annually + before major releases | N/A | All critical/high findings remediated before launch |
| API Fuzzing | Schemathesis (from OpenAPI spec) | Monthly | No (advisory) | Crashes and 500s investigated |
| Infrastructure Scanning | AWS Config + Terraform drift detection | Continuous | Yes (Terraform) | No unapproved drift |
| Browser Security Headers | securityheaders.com + custom check | Every deployment | Yes | Minimum A rating |
| SSL/TLS Configuration | SSL Labs API | Weekly | No (advisory) | A+ rating |

## 5.2 CI Security Gates (Enforced)

```yaml
# Extracted security-relevant steps from CI pipeline:

security-gates:
  # GATE 1: No known secrets in codebase
  - name: Secrets Scan
    run: trufflehog git file://. --only-verified --fail
    # BLOCKS merge if any verified secret found

  # GATE 2: No critical/high vulnerabilities in dependencies
  - name: Dependency Scan
    run: |
      pnpm audit --audit-level=critical
      snyk test --severity-threshold=high
    # BLOCKS merge if critical/high found

  # GATE 3: No critical/high SAST findings
  - name: SAST
    run: snyk code test --severity-threshold=high
    # BLOCKS merge if high/critical code vulnerabilities found

  # GATE 4: Container images clean
  - name: Container Scan
    run: trivy image --severity CRITICAL,HIGH --exit-code 1 noagent-workers:latest
    # BLOCKS if critical/high in container image

  # GATE 5: Terraform plan approved (no drift)
  - name: Infrastructure Check
    run: terraform plan -detailed-exitcode
    # BLOCKS if unexpected infrastructure changes

  # GATE 6: Security headers verified
  - name: Headers Check
    run: |
      curl -sI https://staging.noagent.com | grep -E "strict-transport|x-frame|x-content-type|content-security"
    # BLOCKS if required headers missing
```

## 5.3 Pre-Launch Penetration Test Scope

**In scope:**

- Authentication and session management (login, MFA, session fixation, token handling)
- Authorisation testing (IDOR across all entity types, role escalation, delegate boundary testing)
- Input validation (XSS, SQLi, parameter tampering, file upload manipulation)
- Business logic (offer manipulation, listing status bypasses, payment flow manipulation, viewing double-booking)
- API security (rate limiting effectiveness, authentication bypass, mass assignment)
- File upload security (MIME type bypass, malicious file upload, path traversal)
- Infrastructure (S3 bucket policy, CloudFront config, DNS, TLS)
- Third-party integration security (webhook forgery, callback manipulation)

**Out of scope:**

- Third-party services themselves (Stripe, Onfido, Clerk — covered by their own SOC 2 / PCI compliance)
- Physical security
- Social engineering of NoAgent staff

**Deliverable:** Penetration test report with findings rated by CVSS 3.1, proof of concept for each finding, and remediation guidance. All critical/high findings must be remediated and re-tested before production launch.

---

# 6. Go / No-Go Launch Checklist

## 6.1 Security Go/No-Go Criteria

Each item is rated: **MUST** (blocks launch), **SHOULD** (documented exception required), **NICE** (tracked but non-blocking).

### Authentication & Access Control

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 1 | Email/phone OTP verification functional and enforced | MUST | E2E test passing | ☐ |
| 2 | MFA available for all users and enforced for admin accounts | MUST | Clerk config screenshot + E2E test | ☐ |
| 3 | RBAC middleware on every mutation endpoint | MUST | Automated test: wrong-role returns 403 for every mutation | ☐ |
| 4 | Resource ownership checks on every data-access endpoint | MUST | Automated test: User A cannot access User B's resources (test per entity type) | ☐ |
| 5 | Admin console restricted to allowlisted IPs + MFA | MUST | Network config + manual verification | ☐ |
| 6 | Session expiry and rotation functioning correctly | MUST | Manual test: expired token returns 401, refresh rotation works | ☐ |
| 7 | Account lockout after failed login attempts | MUST | Manual test: 6th attempt locked | ☐ |
| 8 | No user enumeration via auth endpoints | SHOULD | Manual test: register and login with non-existent email → generic message | ☐ |

### Data Protection

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 9 | TLS 1.2+ on all connections (web, API, DB, Redis, S3) | MUST | SSL Labs scan: A+ | ☐ |
| 10 | Encryption at rest on database (RDS) | MUST | AWS console screenshot or Terraform output | ☐ |
| 11 | Encryption at rest on file storage (S3) | MUST | S3 bucket policy verification | ☐ |
| 12 | S3 buckets: BlockPublicAccess enabled on all buckets | MUST | AWS Config rule or manual check | ☐ |
| 13 | PII redacted from application logs | MUST | Log sample review: search for email/phone patterns | ☐ |
| 14 | No secrets in source code repository | MUST | TruffleHog scan: zero findings | ☐ |
| 15 | Secrets stored in AWS Secrets Manager (not env files on disk) | MUST | Infrastructure review | ☐ |
| 16 | Masked communication relay functioning (email + phone proxy) | MUST | E2E test: counterparty cannot see real contact details | ☐ |
| 17 | Deal Room documents accessible only to authorised stakeholders | MUST | Integration test: unauthorised user gets 403 on signed URL request | ☐ |
| 18 | Document integrity hashes computed and stored on upload | SHOULD | Integration test: upload → verify hash matches | ☐ |

### Security Headers & Configuration

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 19 | HSTS header with max-age ≥ 31536000 | MUST | Header check | ☐ |
| 20 | X-Frame-Options: DENY | MUST | Header check | ☐ |
| 21 | X-Content-Type-Options: nosniff | MUST | Header check | ☐ |
| 22 | Content-Security-Policy configured (no unsafe-inline without nonce) | MUST | Header check + CSP evaluator | ☐ |
| 23 | Referrer-Policy: strict-origin-when-cross-origin | MUST | Header check | ☐ |
| 24 | CORS: no wildcard origin in production | MUST | Manual test: cross-origin request from disallowed origin → blocked | ☐ |
| 25 | Debug mode / Swagger UI disabled in production | MUST | Manual check: /api/docs returns 404 in prod | ☐ |

### Input Validation & Injection Prevention

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 26 | Zod validation on every tRPC procedure input | MUST | Code review: no procedure without `.input()` | ☐ |
| 27 | No raw SQL with string interpolation | MUST | SAST scan: zero SQLi findings | ☐ |
| 28 | XSS prevention: DOMPurify on user-generated HTML content | MUST | Manual test: inject `<script>alert(1)</script>` in listing description → sanitised | ☐ |
| 29 | File upload: MIME type verified server-side (magic bytes) | MUST | Integration test: upload .html renamed to .jpg → rejected | ☐ |
| 30 | File upload: EXIF stripping on all images | MUST | Integration test: upload image with GPS data → served image has no EXIF | ☐ |
| 31 | File upload: size limits enforced at presigned URL level | MUST | Integration test: upload >50MB image → rejected by S3 | ☐ |
| 32 | CSRF protection (SameSite cookies + Clerk's built-in protection) | MUST | Manual test: cross-origin POST → rejected | ☐ |

### Rate Limiting & Abuse Prevention

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 33 | Rate limiting on auth endpoints (login, register, password reset) | MUST | Load test: >10 req/min from single IP → 429 | ☐ |
| 34 | Rate limiting on enquiry submission | MUST | Integration test: 11th enquiry in a day → 429 | ☐ |
| 35 | Rate limiting on search API | SHOULD | Load test: >60 req/min → 429 | ☐ |
| 36 | CAPTCHA on registration | MUST | Manual test: registration form includes CAPTCHA | ☐ |
| 37 | Listing creation limits per verification tier | MUST | Integration test: unverified user's 3rd listing → rejected | ☐ |
| 38 | No-show strike system functional | SHOULD | E2E test: 3 no-shows → booking restricted | ☐ |
| 39 | Message content scanning for payment patterns | SHOULD | Integration test: message containing bank details → flagged | ☐ |

### Audit & Monitoring

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 40 | Audit log table: INSERT-only DB role (no UPDATE/DELETE) | MUST | DB permission test: attempt UPDATE → permission denied | ☐ |
| 41 | All events from Section 4 are being logged | MUST | Test each event type triggers audit log entry | ☐ |
| 42 | Sentry configured and receiving errors | MUST | Trigger test error → verify in Sentry dashboard | ☐ |
| 43 | Monitoring alerts configured and tested | MUST | Trigger alert condition → verify PagerDuty/Slack notification | ☐ |
| 44 | Health check endpoint functional | MUST | `/api/health` returns status for DB, Redis, S3 | ☐ |
| 45 | Structured logging operational with PII redaction | MUST | Log sample review | ☐ |

### Compliance & Legal

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 46 | ICO registration complete | MUST | Registration certificate | ☐ |
| 47 | Privacy Policy published and accessible | MUST | URL check + legal review sign-off | ☐ |
| 48 | Terms of Service published and accessible | MUST | URL check + legal review sign-off | ☐ |
| 49 | Cookie consent mechanism functional | MUST | Manual test: banner appears, preferences respected | ☐ |
| 50 | GDPR data export functional (user can request export) | MUST | E2E test: request export → receive JSON within 72 hours | ☐ |
| 51 | GDPR data deletion functional (user can request deletion) | MUST | E2E test: request deletion → account deactivated → PII anonymised after 30 days | ☐ |
| 52 | Incident response runbook documented and team trained | MUST | Runbook document + tabletop exercise conducted | ☐ |
| 53 | Data processing agreements signed with all sub-processors | MUST | DPA register (Clerk, Onfido, Stripe, Postmark, Twilio, AWS) | ☐ |
| 54 | Rental application rejection reasons compliant with Equality Act 2010 | MUST | Structured reason codes reviewed by legal | ☐ |

### Infrastructure & Deployment

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 55 | CI pipeline running all gates (lint, typecheck, tests, SAST, SCA, secrets scan) | MUST | CI run log showing all gates pass | ☐ |
| 56 | Production deployment requires PR approval | MUST | GitHub branch protection config | ☐ |
| 57 | Rollback procedure tested | MUST | Test: deploy → rollback → verify previous version restored | ☐ |
| 58 | Database backup tested (backup + restore verified) | MUST | Backup → restore to test instance → verify data integrity | ☐ |
| 59 | Database migration rollback scripts exist for last 5 migrations | SHOULD | Script review | ☐ |
| 60 | External penetration test completed with no open critical/high findings | MUST | Pentest report + remediation evidence | ☐ |

### Verification & Trust System

| # | Criterion | Priority | Evidence Required | Status |
|---|----------|----------|-------------------|--------|
| 61 | Unverified listing warning banner displayed prominently | MUST | Visual check on listing page | ☐ |
| 62 | ID verification flow end-to-end functional | MUST | E2E test: initiate → Onfido sandbox → badge updated | ☐ |
| 63 | Ownership verification flow functional | SHOULD | E2E test: upload title deed → partner check → badge updated | ☐ |
| 64 | Image duplicate detection operational | SHOULD | Integration test: upload known duplicate image → flagged | ☐ |
| 65 | Risk scoring engine operational (at minimum: heuristic rules) | MUST | Integration test: create listing with anomaly signals → risk score elevated → enters moderation queue | ☐ |

## 6.2 Launch Decision Framework

```
ALL items marked MUST:  Pass? ──→ Yes ──→ Proceed to Go/No-Go meeting
                          │
                          └── No ──→ STOP. Remediate before launch.
                                     No exceptions for MUST items.

Items marked SHOULD:    Pass? ──→ Yes ──→ Clean launch
                          │
                          └── No ──→ Document exception:
                                     - What's the gap?
                                     - What's the residual risk?
                                     - What's the remediation timeline?
                                     - Founder sign-off required on each exception.

Items marked NICE:      Track for post-launch sprint.
```

## 6.3 Post-Launch Security Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Dependency vulnerability scan | Every PR (automated) | CI |
| SAST scan | Every PR (automated) | CI |
| Secrets scan | Every PR (automated) | CI |
| DAST scan (ZAP baseline) | Weekly against staging | DevOps |
| Security header check | Every deployment (automated) | CI |
| Log review (auth failures, moderation actions) | Daily (first 30 days), then weekly | T&S |
| Audit log integrity check | Weekly | DevOps |
| Access review (admin accounts, DB access, AWS IAM) | Monthly | CTO |
| Penetration test | Annually + before major releases | External firm |
| Threat model update | Quarterly + on major feature additions | Security lead |
| Incident response tabletop exercise | Semi-annually | All engineering |
| Secrets rotation (API keys, DB passwords) | Quarterly (90-day max) | DevOps |
| SSL certificate monitoring | Continuous (automated alert at 14 days before expiry) | DevOps |
| Third-party vendor security review | Annually | CTO + Legal |
| Compliance audit (GDPR, data retention, deletion requests) | Quarterly | Legal + Engineering |

---

*End of NoAgent Pre-Launch Security Review*

*This document should be updated as the system evolves. Security is not a checklist — it is a continuous process.*

*Companion documents: NoAgent End-State Spec (Prompt 1), Build Plan & Repo Scaffolding (Prompt 2)*
