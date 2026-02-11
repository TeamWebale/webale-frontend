# 🎨 WEBALE FUNDRAISING APP - MASTER LAYOUT SPECIFICATION

> ⚠️ **CRITICAL**: This document defines the OFFICIAL layout structure.
> ALL future updates MUST follow this specification. NO EXCEPTIONS.
> Share this file at the start of every session.

---

## 🏗️ MASTER LAYOUT STRUCTURE (ALL AUTHENTICATED PAGES)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVBAR                                     │
│  ┌────────────────┐                          ┌─────────────────────────┐   │
│  │ W  Webale      │                          │ ☀️ │ 🇬🇧▼ │ 🔔 │ 🏠 Home │ Logout │
│  │   Private Group│                          └─────────────────────────┘   │
│  │   Fundraising  │                                                         │
│  └────────────────┘                                                         │
├────────────────┬────────────────────────────────────────────┬───────────────┤
│                │                                            │               │
│  LEFT SIDEBAR  │           MAIN CONTENT AREA                │ RIGHT SIDEBAR │
│                │  ┌──────────────────────────────────────┐  │               │
│  ┌───────────┐ │  │         PROFILE BANNER               │  │ ┌───────────┐│
│  │ 🏠 Home   │ │  │  [AN] Amina Nantale 🇺🇬              │  │ │🔴 Live    ││
│  ├───────────┤ │  │       amina@web.ug                   │  │ │Donor Feed ││
│  │ ➕ Create │ │  │       📅 Member since Jan 2026       │  │ │           ││
│  │   Group   │ │  └──────────────────────────────────────┘  │ │ Recent    ││
│  ├───────────┤ │                                            │ │ pledges...││
│  │ 📈 Activity│ │  ┌──────────────────────────────────────┐  │ └───────────┘│
│  │   Feed    │ │  │         PAGE CONTENT                 │  │               │
│  ├───────────┤ │  │                                      │  │ ┌───────────┐│
│  │ 👤 Profile│ │  │  (Dashboard cards, Group details,    │  │ │Milestones ││
│  ├───────────┤ │  │   Settings forms, etc.)              │  │ │           ││
│  │ ⚙️ Settings│ │  │                                      │  │ │🎯 Sub-    ││
│  └───────────┘ │  │                                      │  │ │Goals      ││
│                │  │                                      │  │ │           ││
│  ─────────────│  │                                      │  │ │[Add Goal] ││
│  QUICK STATS   │  │                                      │  │ └───────────┘│
│  ┌───────────┐ │  │                                      │  │               │
│  │Total    4 │ │  │                                      │  │               │
│  │Groups     │ │  │                                      │  │               │
│  ├───────────┤ │  │                                      │  │               │
│  │Admin    2 │ │  │                                      │  │               │
│  │Groups     │ │  │                                      │  │               │
│  ├───────────┤ │  │                                      │  │               │
│  │Member   2 │ │  └──────────────────────────────────────┘  │               │
│  │Groups     │ │                                            │               │
│  └───────────┘ │                                            │               │
│                │                                            │               │
└────────────────┴────────────────────────────────────────────┴───────────────┘
```

---

## 📐 COMPONENT SPECIFICATIONS

### 1. TOP NAVBAR (Always Visible)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────┐                    ┌─────────────────────────────────┐│
│  │  W              │                    │  ☀️  │  🇬🇧▼  │  🔔  │  🏠 Home  │  Logout  ││
│  │    Webale       │                    └─────────────────────────────────┘│
│  │    Private Group│                                                        │
│  │    Fundraising  │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Logo Structure (REQUIRED):**
- Large "W" icon/letter (brand mark) - prominent, stylized
- "Webale" text (brand name) - to the right of W
- "Private Group" tagline - below Webale
- "Fundraising" tagline - below Private Group

**Right Side Controls:**
- ☀️/🌙 Theme toggle (dark/light mode)
- 🇬🇧▼ Language selector dropdown
- 🔔 Notification bell with unread badge
- 🏠 Home button
- Logout button

**Styling:**
- Background: Dark gradient or solid dark (#1a202c)
- Height: ~70px
- Position: Fixed top
- Z-index: 1000

---

### 2. LEFT SIDEBAR (Always Visible When Logged In)

**Width:** 200-220px  
**Position:** Fixed/Sticky  
**Background:** White or light (#ffffff)

> ⚠️ **IMPORTANT:** ALL navigation buttons MUST have colored backgrounds!

**Navigation Links (WITH BACKGROUNDS):**
```
┌────────────────────────────────────────┐
│ 🏠 Home          │ ← Blue background   │  ** LABEL IS "Home" NOT "Dashboard" **
├────────────────────────────────────────┤
│ ➕ Create Group  │ ← Teal background   │
├────────────────────────────────────────┤
│ 📈 Activity Feed │ ← Pink background   │
├────────────────────────────────────────┤
│ 👤 Profile       │ ← Green background  │
├────────────────────────────────────────┤
│ ⚙️ Settings      │ ← Gray background   │
└────────────────────────────────────────┘
```

**Button Styling (REQUIRED):**
| Button | Icon | Label | Background Color | Text Color |
|--------|------|-------|------------------|------------|
| Home | 🏠 | Home | `#4299e1` (Blue) | White |
| Create Group | ➕ | Create Group | `#38b2ac` (Teal) | White |
| Activity Feed | 📈 | Activity Feed | `#ed64a6` (Pink) | White |
| Profile | 👤 | Profile | `#48bb78` (Green) | White |
| Settings | ⚙️ | Settings | `#718096` (Gray) | White |

**Active State:**
- Brighter/lighter version of the button's color
- Left border accent (3px solid)
- Slightly elevated shadow

**Quick Stats Section:**
```
───────────────────────
QUICK STATS
┌────────────────────┐
│ Total Groups    4  │  ← Purple gradient background
└────────────────────┘
┌────────────────────┐
│ Admin Groups    2  │  ← Green gradient background
└────────────────────┘
┌────────────────────┐
│ Member Groups   2  │  ← Blue gradient background
└────────────────────┘
```

---

### 3. PROFILE BANNER (⚠️ CRITICAL PLACEMENT)

> **CRITICAL:** Profile banner goes ONLY at the top of the MAIN CONTENT column.
> It does NOT span full width. It sits between left sidebar and right sidebar.

```
         ┌──────────────────────────────────────┐
         │         PROFILE BANNER               │
         │  ┌────┐                              │
         │  │ AN │  Amina Nantale 🇺🇬           │
         │  │ ✏️ │  amina@web.ug               │
         │  └────┘  📅 Member since Jan 2026    │
         └──────────────────────────────────────┘
```

**Styling:**
- Background: Purple gradient (linear-gradient #667eea → #764ba2)
- Border-radius: 12-16px (rounded corners)
- Padding: 16-20px
- Contains: Avatar with initials, Edit button, Name with flag, Email, Member since

**Edit Profile Button (✏️) Behavior:**
> ⚠️ **IMPORTANT:** When clicked, navigate to Profile page AND automatically open the "Choose Your Avatar" popup/modal.

```javascript
// Example implementation:
onClick={() => {
  navigate('/profile', { state: { openAvatarModal: true } });
}
```

The Profile page should check for this state and auto-open the avatar selection modal.

---

### 4. RIGHT SIDEBAR

**Width:** 280-300px  
**Position:** Sticky  
**Visibility:** 
- GroupDetails page: Always visible (with Live Donor Feed + Milestones)
- Dashboard page: Always visible (with relevant widgets)
- Other pages: Optional

**GroupDetails Right Sidebar Contains:**

**Card 1: Live Donor Feed**
```
┌─────────────────────────┐
│ 🔴 Live Donor Feed      │  ← Red pulsing dot
├─────────────────────────┤
│                         │
│ [Recent pledge 1]       │
│ [Recent pledge 2]       │
│ [Recent pledge 3]       │
│                         │
│ 💡 Updates every 30 sec │
│                         │
│              + Add Sub-Goal │
└─────────────────────────┘
```

**Card 2: Milestones / Sub-Goals**
```
┌─────────────────────────┐
│ Milestones              │
├─────────────────────────┤
│        🎯               │
│                         │
│   No sub-goals yet      │
│                         │
│ [Create First Sub-Goal] │
│                         │
└─────────────────────────┘
```

**Dashboard Right Sidebar Contains:**
- Recent Activity widget
- Upcoming Deadlines widget
- Or similar dashboard-relevant widgets

---

### 5. DASHBOARD PAGE LAYOUT

> ⚠️ **IMPORTANT:** Dashboard MUST follow the same 3-column layout as all other pages!

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVBAR                                     │
│  [W Webale - Private Group - Fundraising]          [☀️][🇬🇧▼][🔔][🏠][Logout] │
├────────────────┬────────────────────────────────────────────┬───────────────┤
│                │                                            │               │
│  LEFT SIDEBAR  │           MAIN CONTENT                     │ RIGHT SIDEBAR │
│                │  ┌────────────────────────────────────┐    │               │
│  ┌───────────┐ │  │ PROFILE BANNER                     │    │ ┌───────────┐│
│  │ 🏠 Home   │ │  │ [AN] Amina  amina@web.ug          │    │ │ Recent    ││
│  │ ➕ Create │ │  └────────────────────────────────────┘    │ │ Activity  ││
│  │ 📈 Activity│ │                                            │ │           ││
│  │ 👤 Profile│ │  ┌────────────────────────────────────┐    │ └───────────┘│
│  │ ⚙️ Settings│ │  │ Welcome Back, Amina! 👋            │    │               │
│  └───────────┘ │  └────────────────────────────────────┘    │ ┌───────────┐│
│                │                                            │ │ Upcoming  ││
│  QUICK STATS   │  ┌──────────┬──────────┬──────────┐       │ │ Deadlines ││
│  ┌───────────┐ │  │ Total    │ Pledged  │ Received │       │ │           ││
│  │Total    4 │ │  │ Groups   │ Amount   │ Amount   │       │ └───────────┘│
│  │Admin    2 │ │  │    4     │  $5,000  │  $3,200  │       │               │
│  │Member   2 │ │  └──────────┴──────────┴──────────┘       │               │
│  └───────────┘ │                                            │               │
│                │  ┌────────────────────────────────────┐    │               │
│                │  │ MY GROUPS                          │    │               │
│                │  │ [Group 1 card]                     │    │               │
│                │  │ [Group 2 card]                     │    │               │
│                │  │ [Group 3 card]                     │    │               │
│                │  └────────────────────────────────────┘    │               │
│                │                                            │               │
└────────────────┴────────────────────────────────────────────┴───────────────┘
```

---

### 6. GROUP DETAILS PAGE LAYOUT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVBAR                                     │
├────────────────┬────────────────────────────────────────────┬───────────────┤
│                │                                            │               │
│  LEFT SIDEBAR  │           MAIN CONTENT                     │ RIGHT SIDEBAR │
│                │  ┌────────────────────────────────────┐    │               │
│  [Nav Buttons] │  │ PROFILE BANNER                     │    │ 🔴 Live Donor │
│                │  └────────────────────────────────────┘    │    Feed       │
│  QUICK STATS   │                                            │               │
│                │  ┌────────────────────────────────────┐    │  + Add Sub-Goal│
│                │  │ GROUP HEADER                       │    ├───────────────┤
│                │  │ [N] Admin badge                    │    │               │
│                │  │ Description                        │    │  Milestones   │
│                │  │ [Action Buttons Row 1]             │    │  🎯           │
│                │  │ [Action Buttons Row 2]             │    │               │
│                │  └────────────────────────────────────┘    │ [Create First]│
│                │                                            │               │
│                │  ┌────────────────────────────────────┐    │               │
│                │  │ STATS BAR                          │    │               │
│                │  │ Pledged / Received / Progress      │    │               │
│                │  └────────────────────────────────────┘    │               │
│                │                                            │               │
│                │  ┌────────────────────────────────────┐    │               │
│                │  │ TABS (7 total)                     │    │               │
│                │  │ [Overview][Pledges][Members]       │    │               │
│                │  │ [Activity][Recurring][Audit][Admin]│    │               │
│                │  └────────────────────────────────────┘    │               │
│                │                                            │               │
│                │  ┌────────────────────────────────────┐    │               │
│                │  │ TAB CONTENT                        │    │               │
│                │  └────────────────────────────────────┘    │               │
│                │                                            │               │
└────────────────┴────────────────────────────────────────────┴───────────────┘
```

---

### 7. TAB NAVIGATION (GroupDetails Page)

**Required Tabs (in this exact order):**

| # | Tab | Icon | Description | Visible To |
|---|-----|------|-------------|------------|
| 1 | Overview | 📊 | Group summary, recent activity | All |
| 2 | Pledges | 💰 | List of all pledges | All |
| 3 | Members | 👥 | Member list with profiles | All |
| 4 | Activity | 📈 | Activity feed/timeline | All |
| 5 | Recurring | 🔄 | Recurring pledge settings | All |
| 6 | Audit | 📋 | Audit trail/logs | Admin only |
| 7 | Admin | ⚙️ | Admin settings | Admin only |

---

## 🎨 COLOR PALETTE

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary | Purple/Indigo | `#667eea` |
| Primary Dark | Deep Purple | `#764ba2` |
| Secondary | Teal | `#38b2ac` |
| Success | Green | `#48bb78` |
| Warning | Orange | `#ed8936` |
| Error/Danger | Red | `#e53e3e` |
| Pink | Pink | `#ed64a6` |
| Admin Badge | Orange | `#ed8936` |
| Member Badge | Green | `#48bb78` |
| Navbar BG | Dark | `#1a202c` |
| Sidebar BG | White | `#ffffff` |
| Card BG | White | `#ffffff` |
| Page BG | Light Gray | `#f7fafc` |
| Text Primary | Dark Gray | `#2d3748` |
| Text Secondary | Gray | `#718096` |
| Text Muted | Light Gray | `#a0aec0` |
| Border | Light | `#e2e8f0` |

**Left Sidebar Button Colors:**
| Button | Background | Hex |
|--------|------------|-----|
| Home | Blue | `#4299e1` |
| Create Group | Teal | `#38b2ac` |
| Activity Feed | Pink | `#ed64a6` |
| Profile | Green | `#48bb78` |
| Settings | Gray | `#718096` |

---

## 📱 RESPONSIVE BREAKPOINTS

| Screen Width | Left Sidebar | Right Sidebar | Profile Banner |
|--------------|--------------|---------------|----------------|
| > 1200px | ✅ Visible | ✅ Visible | ✅ In main column |
| 900-1200px | ✅ Visible | ❌ Hidden | ✅ In main column |
| < 900px | ❌ Hidden (use bottom nav) | ❌ Hidden | ✅ In main column |

---

## 🚫 NEVER DO THIS

1. ❌ **Never** put Profile Banner at full page width spanning all columns
2. ❌ **Never** remove the left sidebar on desktop
3. ❌ **Never** remove Quick Stats from left sidebar
4. ❌ **Never** change the tab order
5. ❌ **Never** remove Live Donor Feed from right sidebar
6. ❌ **Never** remove the logo taglines ("Private Group", "Fundraising")
7. ❌ **Never** forget the Audit and Admin tabs (7 tabs total)
8. ❌ **Never** use plain/unstyled navigation buttons - ALL must have colored backgrounds
9. ❌ **Never** label the first nav button "Dashboard" - it MUST be "Home"
10. ❌ **Never** remove the right sidebar from Dashboard page

---

## ✅ ALWAYS DO THIS

1. ✅ Profile Banner ONLY in main content column (not full width)
2. ✅ Keep 3-column layout on ALL authenticated pages (including Dashboard)
3. ✅ Keep left sidebar with navigation + quick stats
4. ✅ ALL left sidebar nav buttons must have colored backgrounds
5. ✅ First nav button must be labeled "Home" (not "Dashboard")
6. ✅ Keep all 7 tabs on GroupDetails: Overview, Pledges, Members, Activity, Recurring, Audit, Admin
7. ✅ Show right sidebar on GroupDetails AND Dashboard
8. ✅ Keep logo with both taglines ("Private Group", "Fundraising")
9. ✅ Maintain consistent color palette
10. ✅ Edit profile pencil opens avatar selection modal on Profile page

---

## 🔗 PROFILE BANNER EDIT BUTTON BEHAVIOR

When the edit/pencil button (✏️) on the Profile Banner is clicked:

1. Navigate to `/profile` page
2. Automatically open the "Choose Your Avatar" modal/popup
3. Implementation:

```javascript
// In ProfileBanner.jsx
const navigate = useNavigate();

const handleEditClick = () => {
  navigate('/profile', { state: { openAvatarModal: true } });
};

// In Profile.jsx
const location = useLocation();
const [showAvatarModal, setShowAvatarModal] = useState(false);

useEffect(() => {
  if (location.state?.openAvatarModal) {
    setShowAvatarModal(true);
    // Clear the state so it doesn't reopen on refresh
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
```

---

## 📋 FILE CHECKLIST

### Required Layout Files:
```
frontend/src/
├── App.jsx                         ← Main app with providers
├── components/
│   ├── Navbar.jsx                  ← Top navigation bar with logo + taglines
│   ├── MainLayout.jsx              ← 3-column layout with ProfileBanner inside
│   ├── NotificationBell.jsx        ← Notification dropdown
│   └── PaymentButton.jsx           ← Payment button component
├── context/
│   ├── ThemeContext.jsx            ← Dark/light mode
│   ├── LanguageContext.jsx         ← Multi-language
│   └── NotificationContext.jsx     ← Notifications
└── pages/
    ├── Dashboard.jsx               ← With MainLayout (3 columns + right sidebar)
    ├── GroupDetails.jsx            ← With all 7 tabs + right sidebar
    ├── Profile.jsx                 ← With avatar modal auto-open support
    └── ...other pages
```

---

## 📝 HOW TO USE THIS DOCUMENT

**At the start of EVERY session:**
1. Share this document with Claude
2. Say: "Please read LAYOUT_SPEC.md before making changes"

**Before any layout changes:**
1. Review this spec
2. Verify changes don't violate rules
3. Keep 3-column structure intact

**If unsure:**
1. Ask before making layout changes
2. Reference this document
3. Check against the screenshot

---

## 🖼️ REFERENCE POINTS

The layout should always include:
- ✅ Navbar with W logo + "Webale" + "Private Group" + "Fundraising" taglines
- ✅ Left sidebar with COLORED nav buttons (Home, Create, Activity, Profile, Settings) + Quick Stats
- ✅ Profile banner ONLY in main content column
- ✅ Right sidebar on Dashboard AND GroupDetails pages
- ✅ All 7 tabs on GroupDetails page
- ✅ Edit pencil on profile banner opens avatar modal

---

*Last Updated: February 2026*  
*Version: 3.0*
