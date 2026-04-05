# RoadMap

## **🚀NoAgent MVP Roadmap**

Excellent — you’re now at the **perfect transition point** 🎯

You’ve defined:

✅ User journeys (Seller / Buyer / Admin)

✅ Platform logic and automation flow

✅ Research hypotheses and UX principles

Now the focus is to **translate this into a lean, testable MVP** that actually works end-to-end — from seller intake → listing → buyer enquiry → admin oversight — using the **simplest no-code tech stack possible** (Google + Framer/Webflow + Airtable backend).

Here’s your **MVP roadmap** broken into 4 clear stages:

---

## **🚀NoAgent MVP Roadmap**

---

### **🧩 Stage 1 — Core System Design (1–2 weeks)**

Goal: Define *exactly what the MVP does and doesn’t do.*

**Key Outputs:**

- ✅ MVP feature list (must-have vs. nice-to-have)
- ✅ Data model: Seller / Listing / Buyer / Message / Viewing
- ✅ Workflow chart (Seller → Buyer → Admin triggers)
- ✅ Brand + UX tone (you already have this: No fees. No commission. NoAgent.)

**Example MVP Scope:**

| **Function** | **Included** | **Tool** |
| --- | --- | --- |
| Seller intake form | ✅ | Google Form / Airtable Form |
| Listing database | ✅ | Airtable |
| Auto listing page | ✅ | Framer / Webflow CMS sync |
| Buyer enquiry form | ✅ | Webflow + Email or Airtable webhook |
| Admin dashboard | ✅ | Airtable views |
| Chat or message system | 🔸 Basic email handoff for MVP | Gmail / Make.com |
| Calendar sync | 🔸 Manual confirmations for MVP | Google Calendar |
| Verification | 🔸 Email + manual ID step | Google Drive / admin check |

---

### **⚙️ Stage 2 — System Build (2–4 weeks)**

Goal: Build and connect the minimum live flow using no-code tools.

**Stack (based on what you already prefer):**

- **Frontend:** Framer (public site, listing pages, clean design)
- **Backend:** Airtable (acts as your database + light CRM)
- **Automation:** Make.com (connects forms → Airtable → emails)
- **Communication:** Gmail (auto replies, notifications)
- **Admin View:** Airtable dashboards (filtered views for moderation)

**Core Flows to Implement:**

1. Seller fills intake form → data lands in Airtable → admin review toggle
2. Approved listing auto-publishes to Webflow/Framer CMS
3. Buyer submits enquiry → creates new row in “Leads” table → seller notified
4. Admin oversight dashboard shows live listings, leads, and approval status

---

### **🧪 Stage 3 — Internal Testing (1–2 weeks)**

Goal: Prove the workflow works for at least **1 live seller → 1 real buyer**.

**Steps:**

- Use 1–2 test listings (yours or friends)
- Simulate a real enquiry from the buyer side
- Test each step (form, listing, lead notification, approval)
- Measure time, clarity, and friction points

**Success Criteria:**

- Listing can be created + displayed publicly
- Buyer can message or register interest
- You receive notifications
- Data syncs properly (no manual patching)

---

### **📣 Stage 4 — Soft Launch (2–4 weeks)**

Goal: Get 3–5 real sellers using it to list properties and collect feedback.

**Actions:**

- Launch lightweight landing page:
    
    “Sell your home. No fees. No commission. NoAgent.”
    
- Integrate analytics (Google Analytics / Framer Insights)
- Track where users drop off (form completion rate, buyer enquiries)
- Add first trust proof (testimonials, “verified seller” badge)

**Deliverables:**

- Working MVP site
- Airtable CRM
- Admin dashboard
- 3–5 live listings + real feedback

---

### **🧭 Next Phase (Post-MVP):**

After successful soft launch:

- Add buyer dashboards
- Enable calendar viewings & in-app chat
- Introduce “Verified Seller” automation (ID API)
- Prepare for scalability (FeedSync, conveyancing integration)

---

## **🧠 Recommended Immediate Next Steps (This Week)**

| **Task** | **Owner** | **Tool** |
| --- | --- | --- |
| 1️⃣ Finalise MVP feature checklist | You + me | Google Sheet |
| 2️⃣ Build Seller Intake Form (Google or Airtable) | You | Airtable Form |
| 3️⃣ Set up Airtable base (Listings + Leads + Admin) | Me to guide | Airtable |
| 4️⃣ Choose Framer layout (Landing + Listing Template) | You | Framer |
| 5️⃣ Define notification emails | Me | Gmail templates via Make |

---

Would you like me to create the **MVP Feature Checklist (Stage 1)** next — a simple table that divides all key features into **“MVP / Later / Optional”** so you can see what to build first and what to park for Phase 2?

(It will plug straight into your Notion or Google Sheet.)

## **NoAgent MVP Feature Checklist**

It’s structured for you to paste directly into Notion or Google Sheets and will serve as your “build-now vs. later” control board.

---

## **✅ NoAgent MVP Feature Checklist**

| **Category** | **Feature** | **Description / Purpose** | **MVP (Build Now)** | **Later (Phase 2+)** | **Optional / Future Idea** | **Tool / Integration** |
| --- | --- | --- | --- | --- | --- | --- |
| 🏠 **Seller Onboarding** | Seller intake form | Collect property details, photos, contact info | ✅ |  |  | Google Form / Airtable Form |
|  | Seller ID verification | Manual upload & admin approval | ✅ Manual | ✅ Auto (Onfido API) |  | Google Drive / Onfido |
|  | Seller dashboard | View listings & leads |  | ✅ |  | Glide / Layer |
|  | Photo assistance | Upload or request pro photo service | ✅ |  |  | Airtable form choice |
| 💬 **Buyer Engagement** | Property search / browse page | Public view of verified listings | ✅ |  |  | Framer / Webflow |
|  | Buyer enquiry form | Simple form to contact seller | ✅ |  |  | Webflow + Airtable webhook |
|  | Buyer account | Save favourites, track enquiries |  | ✅ |  | Glide / Web app |
|  | Buyer verification | Optional ID check for serious buyers |  | ✅ |  | Onfido / email |
|  | Buyer dashboard (future “hub”) | Track listings from anywhere |  |  | ✅ | Airtable + Glide |
| ⚙️ **Admin Operations** | Listing approval flow | Approve, reject, or edit submissions | ✅ |  |  | Airtable |
|  | Quality check automation | Detect missing data / spam |  | ✅ |  | Make.com / custom rules |
|  | Moderation log | Track flagged messages or reports | ✅ Manual | ✅ Auto |  | Airtable |
|  | Analytics dashboard | Track KPIs (listings, enquiries, conversion) | ✅ Basic | ✅ Full |  | Airtable / Google Data Studio |
| 🗓 **Viewing & Communication** | Viewing request form | Buyer requests time slot | ✅ |  |  | Airtable + Google Calendar |
|  | Calendar sync | Auto-confirm & reminders |  | ✅ |  | Google Calendar API |
|  | Chat / messaging | Buyer–seller direct contact |  | ✅ |  | Twilio / Tidio |
| 💰 **Offer & Deal Stage** | Make Offer form | Buyer submits offer | ✅ (simple form) | ✅ Automated flow |  | Airtable |
|  | Offer tracker | Sellers see offers in dashboard |  | ✅ |  | Glide / Airtable |
|  | Legal docs upload | EPC, Title, contract upload | ✅ Manual | ✅ Auto validate |  | Google Drive |
|  | Conveyancing partner link | Connect users to partner service |  | ✅ |  | Partner API |
| 🔒 **Compliance & Trust** | GDPR consent + logs | Store consent data | ✅ |  |  | Airtable |
|  | AML alerts | Review suspicious users |  | ✅ |  | Admin backend |
|  | Verified badge system | Visual trust layer | ✅ Manual | ✅ Automated |  | Framer CMS |
| 🎨 **Marketing & UX** | Landing page | “Sell your home. No fees. No commission.” | ✅ |  |  | Framer |
|  | Savings calculator | Show how much sellers save |  | ✅ |  | Webflow / Script |
|  | Testimonials / social proof | Add trust | ✅ (manual text) | ✅ Automated collection |  | Airtable / Framer |
| 🧠 **Feedback & Learning** | Post-sale feedback form | Gather insights from users | ✅ |  |  | Google Form |
|  | NPS survey | Measure satisfaction |  | ✅ |  | Airtable |
|  | Analytics setup | Track conversion, usage | ✅ |  |  | Google Analytics / Framer Insights |

---

### **🔍 MVP Focus Summary (What to Build First)**

✅ **Build Now (MVP)**

- Seller intake form + listing approval
- Buyer enquiry flow
- Public listing pages (Framer/Webflow)
- Admin Airtable dashboard
- Manual verification & communication (email-based)

🔸 **Phase 2+ (Next)**

- In-app chat + calendar sync
- Verified badge automation
- Offer tracker
- Seller / Buyer dashboards

💡 **Optional Future Ideas**

- Buyer Hub (save listings from anywhere)
- AI listing copywriter (“Describe your property for you”)
- Predictive pricing & offer ranking

---

### **⚙️ Next Step**

Let’s now build your **Airtable MVP Backend Structure** — the tables and automations to power this checklist:

**Tables:** Sellers · Listings · Buyers · Enquiries · Offers · Admin Tasks

**Automations:** “New Form → Admin Review → Publish → Notify Seller”

Would you like me to create that Airtable base schema next (with field names, relationships, and automation triggers)?

## **🧱NoAgent MVP Airtable Base**

### **1️⃣ Sellers**

**Purpose:** Store and verify seller information before listings go live.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Seller ID | Auto number | 001 |
| Full Name | Single line text | “Jane Smith” |
| Email | Email | jane@noagent.uk |
| Phone | Phone | +44 7700… |
| Property Address | Linked to *Listings* | One-to-many relationship |
| Verification Status | Single select | ⏳ Pending / ✅ Verified / ❌ Rejected |
| ID Upload (manual) | Attachment | Passport / driving licence |
| Notes | Long text | Admin remarks |
| Created Date | Created time | Auto |
| Verified By (Admin) | Collaborator | Select admin reviewer |

**Automation Example:**

➡️ When a new seller record is created → send email to admin “New Seller Pending Verification.”

---

### **2️⃣ Listings**

**Purpose:** Core of the system — where property details live and get published.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Listing ID | Auto number | 2025-001 |
| Seller (linked) | Link to *Sellers* | 1:1 |
| Title | Text | “Modern 3-Bed Flat in Ilford” |
| Description | Long text | “Bright 3-bedroom with garden access…” |
| Photos | Attachment | Upload up to 10 |
| Address | Text | Full or postcode |
| Price (£) | Number | 425000 |
| Bedrooms | Number | 3 |
| Bathrooms | Number | 2 |
| Property Type | Single select | Flat / House / Bungalow |
| Status | Single select | 🟡 Draft / 🟢 Live / 🔴 Sold |
| Verification | Lookup (from Seller) | Shows seller’s verified status |
| Listing URL | Formula | Framer or Webflow link |
| Created Date | Created time | Auto |
| Approved By (Admin) | Collaborator | Reviewer name |
| Approval Date | Date | Auto timestamp |

**Automation Example:**

➡️ When Status = “Live” → send notification to seller “Your property is live.”

---

### **3️⃣ Buyers**

**Purpose:** Track buyers who submit enquiries or offers.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Buyer ID | Auto number | 1001 |
| Full Name | Text | “Mark Reynolds” |
| Email | Email | mark@email.com |
| Phone | Phone | 077… |
| Verification | Single select | ✅ Verified / ⏳ Pending |
| Interested Listings | Linked to *Listings* | Many-to-many |
| Notes | Long text | “First-time buyer, mortgage approved.” |
| Created Date | Created time | Auto |

**Automation Example:**

➡️ New enquiry form → auto-create buyer record if email not found.

---

### **4️⃣ Enquiries**

**Purpose:** Connect buyers to listings — track interest & first contact.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Enquiry ID | Auto number | 5001 |
| Listing (linked) | Link to *Listings* |  |
| Buyer (linked) | Link to *Buyers* |  |
| Message | Long text | “Is this still available?” |
| Enquiry Date | Created time | Auto |
| Status | Single select | 🟢 New / 💬 Replied / ✅ Closed |
| Seller Response | Long text | Admin or seller reply summary |
| Follow-up Needed | Checkbox | Yes / No |
| Admin Notes | Long text | For moderation / quality |

**Automation Example:**

➡️ When new enquiry → send notification to seller (“New enquiry from [Buyer Name]”)

➡️ If Status changes to “Closed” → archive in admin view.

---

### **5️⃣ Offers**

**Purpose:** Track offers from buyers and responses from sellers.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Offer ID | Auto number | 9001 |
| Listing (linked) | Link to *Listings* |  |
| Buyer (linked) | Link to *Buyers* |  |
| Offer Amount (£) | Currency | 420000 |
| Offer Date | Date |  |
| Status | Single select | 💬 Sent / ⏳ Under Review / ✅ Accepted / ❌ Rejected |
| Seller Comment | Long text | “Happy to accept if chain-free.” |
| Admin Review | Checkbox | Reviewed by Admin |
| Offer Docs | Attachment | Optional proof of funds |
| Updated | Last modified | Auto |

**Automation Example:**

➡️ When status = “Accepted” → email both seller + buyer + admin.

---

### **6️⃣ Admin Tasks**

**Purpose:** Internal dashboard for moderation, follow-up, and reporting.

**Fields:**

| **Field** | **Type** | **Example / Notes** |
| --- | --- | --- |
| Task ID | Auto number | 7001 |
| Type | Single select | Verification / Support / Moderation / Bug |
| Related Listing | Link to *Listings* | Optional |
| Assigned To | Collaborator | Admin name |
| Status | Single select | To Do / In Progress / Done |
| Priority | Single select | 🔴 High / 🟡 Medium / 🟢 Low |
| Created Date | Auto |  |
| Notes | Long text |  |

**Automation Example:**

➡️ When flagged chat or listing appears → auto-create admin task (type “Moderation”)

---

## **⚙️ Recommended Automations Summary**

| **Trigger** | **Action** |
| --- | --- |
| New Seller → Pending | Notify Admin (email/slack) |
| Seller Verified | Auto-update linked listings |
| Listing Approved → Live | Notify Seller |
| New Enquiry | Notify Seller + Create Buyer record |
| New Offer | Notify Admin + Log in Offers table |
| Offer Accepted | Email both sides + update status |
| Listing Sold | Archive listing + notify admin |

---

## **🔍 Admin Dashboard Views (Recommended Saved Views)**

| **View Name** | **Table** | **Filter / Purpose** |
| --- | --- | --- |
| **Pending Seller Verification** | Sellers | Verification = Pending |
| **Live Listings Overview** | Listings | Status = Live |
| **New Enquiries (Unread)** | Enquiries | Status = New |
| **Offers in Progress** | Offers | Status != Closed |
| **Admin Tasks (High Priority)** | Admin Tasks | Priority = 🔴 High |
| **Weekly Snapshot (Dashboard)** | Airtable Interface | Summary metrics, counts, charts |

---

## **🌐 Next Step: Connections**

Once you’ve created this structure:

- Connect your **Seller Intake Form** (Google Form or Airtable Form) → *Sellers + Listings* table
- Connect **Buyer Enquiry Form** (on Framer/Webflow) → *Enquiries* table
- Add simple automations using **Airtable Automations** or **Make.com** for notifications

---

Would you like me to create a **visual Airtable schema diagram** next (like an ERD: showing links between Sellers → Listings → Enquiries → Buyers → Offers → Admin Tasks)?

That makes it very clear how data flows for your MVP backend.

## **🧩  NoAgent Airtable Schema — MVP Backend (ERD)**

```jsx
┌───────────────────────────────┐
│          🧍 SELLERS           │
├───────────────────────────────┤
│ Seller ID (Auto)              │
│ Full Name / Email / Phone     │
│ Verification Status ⚡         │
│ ID Upload (Attachment)        │
│ Notes / Created Date          │
│ Verified By (Admin)           │
└─────────────┬─────────────────┘
              │ 1-to-Many
              ▼
┌───────────────────────────────┐
│          🏠 LISTINGS          │
├───────────────────────────────┤
│ Listing ID (Auto)             │
│ Title / Description / Price   │
│ Address / Photos              │
│ Property Type / Bedrooms      │
│ Status (Draft/Live/Sold) ⚡    │
│ Approved By / Approval Date   │
│ Listing URL (Framer link)     │
└──────┬───────────────┬────────┘
       │               │
 1-to-Many         Many-to-Many
       │               │
       ▼               ▼
┌───────────────────────────────┐      ┌───────────────────────────────┐
│          💬 ENQUIRIES         │◄────►│           🙋 BUYERS           │
├───────────────────────────────┤      ├───────────────────────────────┤
│ Enquiry ID (Auto)             │      │ Buyer ID (Auto)              │
│ Listing (Linked)              │      │ Full Name / Email / Phone    │
│ Buyer (Linked)                │      │ Verification (Manual/Auto)   │
│ Message / Date / Status ⚡     │      │ Interested Listings (Linked) │
│ Seller Response / Notes       │      │ Notes / Created Date         │
└──────┬────────────────────────┘      └───────────────────────────────┘
       │
       │ 1-to-Many
       ▼
┌───────────────────────────────┐
│           💰 OFFERS           │
├───────────────────────────────┤
│ Offer ID (Auto)               │
│ Listing (Linked)              │
│ Buyer (Linked)                │
│ Offer Amount / Date ⚡         │
│ Status (Sent/Accepted/etc.)   │
│ Seller Comment / Admin Review │
│ Attachments (Proof of Funds)  │
└───────────┬───────────────────┘
            │  (Activity logged)
            ▼
┌───────────────────────────────┐
│          ⚙️ ADMIN TASKS       │
├───────────────────────────────┤
│ Task ID (Auto)                │
│ Type (Verification, Support)  │
│ Related Listing (Linked)      │
│ Assigned To (Admin)           │
│ Status / Priority ⚡           │
│ Created Date / Notes          │
└───────────────────────────────┘
```

## **📦 NoAgent Airtable MVP Base (CSV Import Kit)**

### **📦 NoAgent Airtable MVP Base (CSV Import Kit)**

**Includes:**

- 6 linked CSVs (with dummy data to demonstrate real flow)
- Each table pre-linked by ID fields so relationships connect automatically

---

### **🧍**

### **Sellers.csv**

| **Seller ID** | **Full Name** | **Email** | **Phone** | **Verification Status** | **ID Upload** | **Notes** | **Created Date** | **Verified By** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | Jane Smith | jane@noagent.uk | +44 7700 123456 | ✅ Verified | passport.pdf | First approved seller | 2025-10-17 | Admin A |
| 002 | Omar Rahman | omar@noagent.uk | +44 7712 334455 | ⏳ Pending | licence.jpg | Awaiting verification | 2025-10-17 |  |

---

### **🏠**

### **Listings.csv**

| **Listing ID** | **Seller ID** | **Title** | **Description** | **Address** | **Price £** | **Bedrooms** | **Bathrooms** | **Type** | **Status** | **Listing URL** | **Approved By** | **Approval Date** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L-001 | 001 | Modern 3-Bed Flat in Ilford | Bright flat with garden access and garage | IG6 4HZ London | 425000 | 3 | 2 | Flat | 🟢 Live | /listing/ilford-flat | Admin A | 2025-10-17 |
| L-002 | 002 | Cozy 2-Bed House in Romford | Recently refurbished home near station | RM6 3PL London | 365000 | 2 | 1 | House | 🟡 Draft | /listing/romford-house |  |  |

---

### **🙋**

### **Buyers.csv**

| **Buyer ID** | **Full Name** | **Email** | **Phone** | **Verification** | **Notes** | **Created Date** |
| --- | --- | --- | --- | --- | --- | --- |
| B-001 | Mark Reynolds | mark@buyer.com | +44 7789 555000 | ✅ Verified | First-time buyer | 2025-10-17 |
| B-002 | Alice Lee | alice@buyer.com | +44 7711 223344 | ⏳ Pending | Relocating from Manchester | 2025-10-17 |

---

### **💬**

### **Enquiries.csv**

| **Enquiry ID** | **Listing ID** | **Buyer ID** | **Message** | **Date** | **Status** | **Seller Response** | **Follow-up** | **Admin Notes** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E-001 | L-001 | B-001 | “Is this still available?” | 2025-10-17 | 🟢 New |  | ✅ |  |
| E-002 | L-001 | B-002 | “Can I book a viewing this weekend?” | 2025-10-17 | 💬 Replied | “Saturday 2 pm works.” |  |  |

---

### **💰**

### **Offers.csv**

| **Offer ID** | **Listing ID** | **Buyer ID** | **Amount £** | **Date** | **Status** | **Seller Comment** | **Admin Review** | **Proof Doc** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| O-001 | L-001 | B-001 | 420000 | 2025-10-17 | ⏳ Under Review | “Happy to accept if chain-free.” | ✅ | proof.pdf |

---

### **⚙️**

### **AdminTasks.csv**

| **Task ID** | **Type** | **Related Listing** | **Assigned To** | **Status** | **Priority** | **Notes** | **Created Date** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-001 | Verification | L-002 | Admin A | In Progress | 🟡 Medium | Verify Omar Rahman ID before publishing | 2025-10-17 |
| T-002 | Support | L-001 | Admin B | Done | 🟢 Low | Helped seller update photos | 2025-10-17 |

---

### **⚙️**

### **How to Import into Airtable**

1. Create a new base → choose **“Start from data → CSV upload.”**
2. Upload each CSV file (Sellers, Listings, Buyers, Enquiries, Offers, AdminTasks).
3. When prompted, choose the matching field types (Email, Number, Single Select).
4. After importing, add **Linked Record fields**:
    - *Listings → Sellers*
    - *Enquiries → Listings* and *Enquiries → Buyers*
    - *Offers → Listings* and *Offers → Buyers*
    - *AdminTasks → Listings*
5. Once links are established, all dummy rows will connect automatically (IDs match).
6. Add **Automations** (e.g., “When new Enquiry → email Seller”).

---

Would you like me to actually generate these CSVs as a downloadable .zip (so you don’t have to copy tables manually)?

You’ll be able to upload them directly into Airtable in seconds.