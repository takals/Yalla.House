# Legal by Country

Status: Not started

# Detai

```jsx

```

Perfect — below is a **practical, production-ready Legal Hub package**, split into:

1. **Baseline legal text outlines (with usable draft language)**
2. **Country-specific checklist (what must differ / be added)**
3. **What to parameterise vs what to keep global**

This is designed so you can:

- start with templates (now)
- localise safely (later)
- avoid rework when adding countries

> ⚠️ Note: This is
> 
> 
> **not legal advice**
> 
> **founder-grade, lawyer-ready draft**
> 

---

# **WF-P4 — LEGAL HUB**

*(Public · Footer only · Country-aware)*

---

# **1️⃣ GLOBAL LEGAL DOCUMENTS (MASTER VERSIONS)**

These exist **once**, with **country annexes where needed**.

---

## **1. Privacy Policy (Global Master)**

### **Purpose**

Explain how data is collected, used, shared, and protected.

### **Must cover (checklist)**

- Who controls the data (NoAgent legal entity)
- What data is collected
    - account info
    - property info
    - messages (incl. WhatsApp metadata)
    - usage analytics
- Legal basis (GDPR Art. 6)
- Who data is shared with
    - portal partners
    - local service partners
    - payment providers
- Data retention periods
- User rights
- International transfers
- Contact for data requests

### **Draft core language (usable)**

> NoAgent acts as a data controller for the operation of the platform.
> 

> We collect and process personal data only where necessary to provide our services, comply with legal obligations, or improve platform functionality.
> 

> Messages exchanged between users are visible only to the participants involved, except where required for safety, compliance, or support.
> 

> We do not sell personal data or use it for third-party advertising.
> 

---

## **2. Terms of Service (Global Master)**

### **Purpose**

Define **what NoAgent is and is not**.

### **Must clearly state (non-negotiable)**

- Platform role only
- No agency / brokerage role
- No commission
- Non-binding offers/applications
- User responsibility
- Partner independence
- Limitation of liability
- Governing law (country-specific)

### **Draft core language**

> NoAgent is a technology platform that enables property listings, communication, and coordination.
> 

> NoAgent does not act as an estate agent, broker, or representative of any party.
> 

> All offers and rental applications submitted through the platform are non-binding expressions of interest.
> 

> NoAgent is not a party to any transaction.
> 

> Local partners, including estate agents and service providers, act independently and under their own responsibility.
> 

---

## **3. Cookie Policy (Global Master)**

### **Purpose**

Transparency + consent.

### **Must cover**

- Essential cookies
- Analytics cookies
- Marketing cookies (if any)
- Cookie management

### **Draft core language**

> We use cookies to ensure the platform functions correctly and to understand how it is used.
> 

> You can manage cookie preferences at any time.
> 

(Use a standard CMP like Cookiebot later.)

---

## **4. GDPR & Safety (Global Master)**

### **Purpose**

Trust + reassurance.

### **Must cover**

- Data protection principles
- Messaging safety
- Reporting abuse
- Human oversight
- No automated decisions

### **Draft core language**

> NoAgent does not use automated decision-making to approve, reject, or rank users.
> 

> All critical actions involve human oversight.
> 

> Users can report misuse or inappropriate behaviour directly through the platform or via support.
> 

---

# **2️⃣ COUNTRY-SPECIFIC CHECKLIST (CRITICAL)**

This is where most platforms get burned.

Use this as a **go/no-go list** per country.

---

## **🇩🇪 Germany (HIGH REQUIREMENTS)**

### **Required**

- ✅ **Imprint (Impressum)** — mandatory
- ✅ VAT ID display
- ✅ Full company address
- ✅ Managing director(s)
- ✅ Register court + number (Handelsregister)
- ✅ Data Protection Officer (if applicable)

### **Legal notes**

- Very strict on consumer transparency
- Imprint must be **1 click away**
- German language version recommended

### **Checklist**

- /legal/imprint visible only in DE
- German translations reviewed
- Hosting provider disclosed (optional but common)

---

## **🇫🇷 France**

### **Required**

- ✅ Legal entity identification
- ✅ Hosting provider info
- ⚠️ Cookie consent very strict (CNIL)

### **Notes**

- Imprint-style page recommended but not identical to DE
- French language strongly preferred

### **Checklist**

- Hosting provider named
- Cookie consent explicit
- Local governing law clause

---

## **🇮🇹 Italy**

### **Required**

- ✅ Company identification
- ⚠️ VAT clarity
- ⚠️ Consumer protection language

### **Notes**

- Less formal than DE
- Still requires clear provider identity

### **Checklist**

- VAT shown where applicable
- Italian governing law clause

---

## **🇪🇸 Spain**

### **Required**

- ✅ “Aviso Legal” equivalent
- ✅ Data protection compliance
- ⚠️ Marketing consent clarity

### **Checklist**

- Legal notice page
- Spanish language option

---

## **🇬🇧 United Kingdom**

### **Required**

- ✅ Company name + address
- ✅ Privacy Policy (UK GDPR)
- ⚠️ No imprint required

### **Notes**

- UK GDPR mirrors EU GDPR (mostly)
- Governing law must be UK

### **Checklist**

- UK GDPR wording
- ICO registration (if required)

---

## **🇳🇱 Netherlands**

### **Required**

- ✅ Company identification
- ⚠️ Consumer clarity
- ⚠️ Cookie compliance

### **Notes**

- Very pragmatic
- English often acceptable

---

## **🇨🇦 Canada (if later)**

### **Required**

- ✅ PIPEDA compliance
- ⚠️ Province-specific nuances (QC!)

### **Checklist**

- Privacy language adjusted
- French for Québec

---

# **3️⃣ WHAT TO PARAMETERISE (IMPORTANT)**

These should be **variables**, not hard-coded text:

| **Item** | **Why** |
| --- | --- |
| Company name | Legal entity may change |
| Address | Country-specific |
| VAT ID | Country-specific |
| Governing law | Mandatory |
| Contact email | Compliance |
| Portal partners list | Avoid hard promises |
| Currency | Local display |

---

# **4️⃣ RECOMMENDED FILE STRUCTURE**

```
/legal
  /privacy        (global)
  /terms          (global)
  /cookies        (global)
  /gdpr-safety    (global)
  /imprint        (DE only)
```

With internal config like:

```
{
  "country": "DE",
  "showImprint": true,
  "currency": "EUR",
  "governingLaw": "Germany"
}
```

---

# **🔒 FINAL LOCK STATEMENT (IMPORTANT)**

I strongly recommend locking this:

> “NoAgent uses a single global legal framework with country-specific disclosures only where legally required, keeping compliance manageable while enabling rapid international expansion.”
> 

---

## **Next best steps (suggested order)**

1. Decide **first launch country** (DE vs UK)
2. Generate **country-specific Imprint + governing law clauses**
3. Create **Partner Master Agreement** (private, next phase)

If you want, next I can:

- draft **Germany Imprint text**
- draft **Master Partner Agreement outline**
- or adapt **Terms of Service** for your first launch country

Just tell me where you want to go next.

Write a clear, specific description of what you want to achieve

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