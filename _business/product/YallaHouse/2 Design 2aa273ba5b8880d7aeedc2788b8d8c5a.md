# 2. Design

- **Dashfolio+ → Yalla.House NoAgent (Simple Change Overview)**
    
    ### **Use Dashfolio+ everything by default. Only change these items:**
    
    ---
    
    ## **1. Brand Accent Color**
    
    ### **🔄 Change:**
    
    - Replace Dashfolio’s original *electric blue* accent color with:
    
    ```
    Yalla.House Accent (Primary): #FFD400
    Yalla.House Accent Hover: #E6C200
    ```
    
    ### **Used for:**
    
    - “List Your Property” button
    - Active sidebar item
    - Hover/active highlights
    - Occasional tags or CTA elements
    
    **Everything else stays Dashfolio’s original color palette.**
    
    ---
    
    ## **2. Global Header (Replace Dashfolio Header)**
    
    ### **🔄 Change:**
    
    Use the Yalla.House navigation bar:
    
    ```
    [🏡 Yalla.House]   [Services ▾]   [About]   [Contact]   [List Your Property ▢]
    ```
    
    ### **Keep:**
    
    - Dashfolio spacing
    - Dashfolio font (Plus Jakarta Sans)
    - Dashfolio dark background (#161616)
    
    Only the **content** of the header changes.
    
    ---
    
    ## **3. Sidebar (Content Change, Style Same)**
    
    ### **🔄 Change sidebar menu items to:**
    
    - Dashboard
    - My Listings
    - Buyer Inquiries
    - Analytics
    - Documents
    - Calendar
    - Settings
    
    ### **Keep:**
    
    - Dashfolio sidebar styling
    - Dashfolio hover & active styles (just recolored to yellow)
    
    ---
    
    ## **4. Right Rail (Only Add on Dashboard + Calendar)**
    
    ### **🔄 Add:**
    
    - Today’s Agenda
    - Quick Links
    
    Only for:
    
    - Dashboard
    - Calendar
    
    Stay in Dashfolio’s panel style.
    
    ---
    
    ## **5. Pages/Sections (New Layouts, Dashfolio Styles)**
    
    You are adding *new content*, but still using:
    
    - Dashfolio typography
    - Dashfolio background colors
    - Dashfolio spacing tokens
    - Dashfolio card styling
    - Dashfolio dark theme everywhere
    
    The *layout* is custom; the *design language* stays native.
    
    ---
    
    # **🎉 Final Summary (Developer-Ready)**
    
    ### **“Use Dashfolio+ exactly as it is. Only apply these changes:”**
    
    1. **Accent color → yellow (#FFD400).**
    2. **Replace header with Yalla.House nav (Services dropdown, WhatsApp, List CTA).**
    3. **Use new sidebar item list (same styling).**
    4. **Add right rail only to Dashboard + Calendar.**
    5. **Follow wireframe layouts but keep all Dashfolio styling.**
    
    👉 No need for custom fonts.
    
    👉 No need for custom design system.
    
    👉 No need to rebuild components.
    
    👉 No extra admin.
    
    Just **content + color + structure**, not *design overhaul*.
    
    ---
    
    If you want, I can now create a **1-page handoff PDF-style summary** for freelancers so you can send them:
    
    - What to keep
    - What to override
    - What to add
    
    Tell me if you’d like that.
    
- Logo Yalla.House
    
    Yalla.House     Services ▾     About     Contact     List Your Property 
    
    # **Header Layout (Simple, Text-Only):**
    
    ```
    Yalla.House     Services ▾     About     Contact     List Your Property
    ```
    
    ### **✔️Rules:**
    
    - **No emojis**
    - **No icons**
    - **Text only**, clean and modern
    - **Hover:** turns yellow (#FFD400)
    - **CTA:** “List Your Property” = Yellow button with black text
    - **Other navigation:** White text, turns slightly brighter on hover (#CCD4D9 → #FFFFFF)
    - **Spacing:** Follow Dashfolio+ default header spacing (wide, airy)
    
    ---
    
    # **🎨 Header Colors**
    
    - **Default link text:** #FFFFFF
    - **Secondary link hover:** #CCD4D9 → #FFFFFF
    - **Hover:** #FFD400
    - **CTA button:**
        - Background: #FFD400
        - Text: #000000
        - Hover: #E6C200
    
    ---
    
    # **🅰 Header Typography**
    
    Matches Dashfolio+ navigation style:
    
    - **Font:** Plus Jakarta Sans
    - **Weight:** SemiBold
    - **Size:** 16–18 px depending on header height
    - **Letter spacing:** Keep Dashfolio defaults
    - **Case:** Title case (Yalla.House, Services, About, Contact)
    
    ---
    
    # **🧩 Implementation Notes for Designer**
    
    - Replace Dashfolio+ header content but **don’t change the styling tokens** (font, spacing, colors except the yellow accents).
    - Dropdown uses Dashfolio’s native dropdown styling (dark background, soft edges).
    - No icons
    
    ---
    
    # **📄 Updated Header**
    
    ```
    Yalla.House     Services ▾     About     Contact     List Your Property
    ```
    
    If you want, I can now:
    
    ### **✔️ Generate a**
    
    ### **visual header mockup**
    
    ### **(text-only version)**
    
    ### **✔️ Provide an**
    
    ### **SVG logo for Yalla.House**
    
    ### **using the exact Dashfolio font**
    
    ### **✔️ Add this update into the canvas Wireframe Document**
    
    ### **✔️ Create a Figma header component spec**