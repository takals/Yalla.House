# MVP Integration check list

Status: Not started

# Detail

integration stack for **Yalla.House** — split into **Must-haves (MVP)**, **Nice-to-have (Phase 2)**, and **Scale**. I’ve picked tools that keep things simple, native-looking in Framer, and low-maintenance.

# **✅ Must-have (MVP)**

1. **Auth & Accounts**
    - **Framer Auth** (built-in) or **Memberstack** (clean UI, roles later).
    - Use for Seller login to the dashboard.
2. **Data & API**
    - **Airtable** (Properties / Availability / Bookings).
    - **Vercel serverless API** (the mini-repo I gave you) to serve live JSON.
3. **Messaging & Notifications**
    - **Email:** Postmark or SendGrid (reliable, simple templates).
    - **WhatsApp/SMS:** **Twilio** (link-based now; Twilio Verify later for OTP).
4. **File Storage & Images**
    - **Cloudinary** (img optimization, fast CDN, easy transforms).
5. **Forms / Intake**
    - **Tally.so** (seller intake, add-listing, service orders) → to Airtable.
6. **Analytics**
    - **Plausible** (lightweight, privacy-friendly) or **GA4** (deeper funnels).
7. **Maps & Address**
    - **Mapbox** (map on property page).
    - **Google Places Autocomplete** (clean address entry in seller forms).
8. **Calendars (Booking)**
    - Your **custom booking** via Airtable + API (what we planned) — no external app.
9. **Docs (EPC/Floorplans)**
    - Host in **Cloudinary**; link or preview in Documents page.
10. **Legal & Cookies**
- **Cookie banner** (Plausible often OK without consent; GA4 needs it).
- **Terms/Privacy**: a simple generated policy (Termly/PrivacyPolicies) to start.

# **✨ Nice-to-have (Phase 2)**

1. **Chat/Support**
    - **Crisp** or **Intercom** (onsite chat; shared inbox for buyer questions).
2. **Email capture & drip**
    - **Mailerlite** or **ConvertKit** (lead capture on marketing pages).
3. **Offer / e-Sign**
    - **PandaDoc** or **DocuSign** for offer letters or MoUs.
4. **Document Collection**
    - **Tally** multi-step forms + file uploads → Airtable; or **Documint** for PDF generation (offers, receipts).
5. **Heatmaps / UX**
    - **Hotjar** or **PostHog** (see where people get stuck).
6. **Uptime & Error Monitoring**
    - **UptimeRobot** (ping API/frontend).
    - **Sentry** (catch frontend/API errors).
7. **Price Comparables**
    - **UK Land Registry Price Paid Data** (open data) via a small cron job to surface local sold prices on the property page.
8. **Address / Postcode data**
    - **Loqate** or **Ideal Postcodes** (tidy UK addresses; reduces typos).
9. **Calendar Files**
    - Generate **.ics** invites on confirm (simple Node lib in your API).

# **🚀 Scale (when you’re ready)**

1. **Feeds to Portals**
    - Partner with **FeedSync / OpenBrix / TheHouseShop** for Rightmove/Zoopla/OTM feeds (when you’re listing at volume).
2. **Search / Discovery**
    - **Algolia** for fast search across properties (later, when inventory grows).
3. **ID / KYC (if you need vetting)**
    - **Onfido** or **Persona** for ID verification on high-value deals.
4. **Data Warehouse**
    - Stream Airtable → **BigQuery**/**Snowflake** via **Make.com** for long-term analytics.
5. **Localization**
    - **Locize/Phrase** when you add DE/FR/US — stores strings centrally.

# **Where each integration appears in the product**

- **Home / Property page:** Mapbox map, Cloudinary images, Plausible/GA4, WhatsApp link, (later) price comparables from Land Registry.
- **/p//book:** Custom booking widget (Airtable+API), email/SMS via Postmark/Twilio, optional .ics file.
- **Seller Dashboard:** Framer Auth/Memberstack, Cloudinary previews, Tally embeds (add listing / order services), live calendar (Airtable), email notifications.
- **Admin Ops:** UptimeRobot, Sentry, Make.com automations (booking emails, Slack alerts).

# **Minimal setup order (do it once, then forget it)**

1. Domain + Framer site + **Plausible/GA4** snippet.
2. **Cloudinary** (grab cloud name; store URLs in Airtable).
3. **Postmark** (one Sender Signature + 2 templates: “Booking request” & “Booking confirmed”).
4. **Twilio** (one WhatsApp/SMS sender; use link format now).
5. **Mapbox** key (property page map).
6. **Tally** forms (Seller Intake, Add Listing, Order Services) → send to Airtable.
7. **Sentry** on Framer + API for error alerts.
8. **UptimeRobot** pings: yalla.house + api.yalla.house.

Want me to drop this into a **Notion checklist** (with toggle sections and “owner / due date” columns), or generate a **one-page “Integration Keys Sheet”** you can share with a freelancer (fields for API keys, where to paste them, and which page uses them)?

# Success Metrics

Define how you will measure progress and success

# Timeline

Set deadlines and milestones

# Action Plan

---

### **📋Yalla.House — Integration Checklist**

---

## **🟡 MVP (Phase 1) — Must-Have Integrations**

> Goal: fully working seller/buyer flow with live data and messaging.
> 

| **✅** | **Integration** | **Purpose** | **Owner** | **Status** | **Notes** |
| --- | --- | --- | --- | --- | --- |
| ☐ | **Framer Auth / Memberstack** | Seller login + roles |  |  | Basic auth first |
| ☐ | **Airtable** | Stores Properties / Availability / Bookings |  |  | API key + base ID |
| ☐ | **Vercel API (Mini-Repo)** | Secure middle layer to Airtable |  |  | From ZIP repo |
| ☐ | **Postmark or SendGrid** | Email confirmations (book / confirm) |  |  | 2 templates |
| ☐ | **Twilio (WhatsApp/SMS)** | Instant buyer/seller messages |  |  | Link format MVP |
| ☐ | **Cloudinary** | Image + file hosting (EPC, floorplan) |  |  | Free plan OK |
| ☐ | **Tally.so** | Seller intake / add listing forms |  |  | Connect to Airtable |
| ☐ | **Plausible Analytics** | Traffic + funnels (lightweight) |  |  | Add script in Framer |
| ☐ | **Mapbox** | Map display on property page |  |  | API key |
| ☐ | **Cookie & Privacy Policy** | Legal requirements |  |  | Termly / PrivacyPolicies.com |

---

## **🟢**

## **Phase 2 — Nice to Have**

> Goal: smarter automation, better UX, early scaling.
> 

| **✅** | **Integration** | **Purpose** | **Owner** | **Status** | **Notes** |
| --- | --- | --- | --- | --- | --- |
| ☐ | **Crisp / Intercom** | Buyer chat + support inbox |  |  |  |
| ☐ | **MailerLite / ConvertKit** | Lead capture / email drips |  |  |  |
| ☐ | **PandaDoc / DocuSign** | Offer letters + signatures |  |  |  |
| ☐ | **Documint / Tally upload** | Collect buyer docs |  |  |  |
| ☐ | **Hotjar / PostHog** | Heatmaps & UX tracking |  |  |  |
| ☐ | **UptimeRobot** | Monitor API + site uptime |  |  |  |
| ☐ | **Sentry** | Error monitoring |  |  |  |
| ☐ | **UK Land Registry Feed** | Local sold price comparison |  |  |  |
| ☐ | **Ideal Postcodes / Loqate** | Clean address entry |  |  |  |
| ☐ | **ICS Calendar files** | Add to buyer calendar on confirm |  |  |  |

---

## **🔵**

## **Phase 3 — Scale Integrations**

> Goal: expand listings, automate feeds, internationalize.
> 

| **✅** | **Integration** | **Purpose** | **Owner** | **Status** | **Notes** |
| --- | --- | --- | --- | --- | --- |
| ☐ | **FeedSync / OpenBrix / TheHouseShop** | Push listings to portals |  |  |  |
| ☐ | **Algolia** | Search & filters across properties |  |  |  |
| ☐ | **Onfido / Persona** | ID /KYC verification |  |  |  |
| ☐ | **BigQuery / Snowflake via Make.com** | Central analytics warehouse |  |  |  |
| ☐ | **Locize / Phrase** | Multi-language content (EN/DE/FR) |  |  |  |

---

## **🧩**

## **Setup Checklist**

| **✅** | **Step** | **Owner** | **Status** | **Notes** |
| --- | --- | --- | --- | --- |
| ☐ | Domain connected: yalla.house + api.yalla.house |  |  |  |
| ☐ | Cloudinary key + folder created |  |  |  |
| ☐ | Postmark templates set (Booking Request / Confirmed) |  |  |  |
| ☐ | Twilio sender approved (WhatsApp sandbox OK) |  |  |  |
| ☐ | Mapbox key added to Framer env vars |  |  |  |
| ☐ | Analytics script verified in header |  |  |  |
| ☐ | Cookie banner enabled (if GA4) |  |  |  |

---

## **🧠**

## **How to use in Notion**

1. Copy everything from “📋 Yalla.House — Integration Checklist”.
2. Paste into your Notion page → it auto-formats into toggles & tables.
3. Add columns “Owner” and “Status” if they’re not visible.
4. Use emojis (✅ In progress / 🟢 Done / 🔴 Blocked).
5. Collapse completed sections when moving to next phase.

---

Would you like me to generate this as a **.md file** so you can upload it directly into Notion (it keeps the toggles and tables intact)?

- [ ]  
- [ ]  

# Related files

[https://www.notion.so](https://www.notion.so)