# DealerGuard Platform — Full Feature Inventory
> POC Build Export | Generated: February 2026

---

## Legend
- ✅ Full access
- 🔶 Restricted / read-only
- ❌ Not applicable

---

## MODULE 1: Dashboard / Portfolio Overview

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Portfolio Health Donut Chart | RAG-split of total dealer count (Green/Amber/Red) | ✅ | ✅ |
| Critical Alerts KPI | Count of Red-rated dealers requiring attention | ✅ | ✅ |
| Average Risk Score KPI | Portfolio-wide mean compliance score /100 | ✅ | ✅ |
| Portfolio Trend Mini Chart | 12-month rolling portfolio score trend line | ✅ | ✅ |
| Score Distribution Chart | Bar chart of dealer scores bucketed across ranges | ✅ | ✅ |
| Section Compliance Chart | Radar/bar showing compliance % per audit section | ✅ | ✅ |
| Regional Summary Table | Performance breakdown by geographic region | ✅ | ✅ |
| Top Risk Dealers Widget | Ranked shortlist of highest-risk dealers | ✅ | ✅ |
| Dealer Watchlist Table | Paginated, searchable, filterable dealer list with score/RAG/trend/CSS | ✅ | ✅ |
| Re-Check Schedule Widget | Upcoming recheck deadlines and completion tracking | ✅ | ✅ |
| Trend Highlights Widget | Notable movers — biggest score gains and drops | ✅ | ✅ |
| Recent Activity Feed | Timestamped log of compliance events | ✅ | ✅ |
| Animated KPI Counters | Smooth number animations on load | ✅ | ✅ |
| Dashboard Skeleton Loader | Loading state placeholder UI | ✅ | ✅ |
| Customer Sentiment Score (CSS) Column | Per-dealer CSS indicator with oversight/reward icon thresholds | ✅ | ✅ |

---

## MODULE 2: Pre-Onboarding Screening

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Pre-Onboarding Application Entry | Initial screening form before full onboarding | ✅ | ✅ |
| Screening Data Badge | Summary badge of pre-screening status | ✅ | ✅ |
| Screening Data Editor | Edit/update screening fields inline | ✅ | ✅ |

---

## MODULE 3: Onboarding Workflow

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| New Application Dialog | Initiate onboarding for a new dealer | ✅ | ✅ |
| 8-Section Compliance Checklist | Legal Status, FCA Auth, Financial, DBS, Training, Complaints, Marketing, KYC/AML | ✅ | ✅ |
| Section Progress Bar | X/8 sections completed tracking | ✅ | ✅ |
| Section Detail Modals | Deep-dive per section with compliance data | ✅ | ✅ |
| File Uploaders (DBS, Training) | Document upload per section with status feedback | ✅ | ✅ |
| Request More Info Email Template | Formal information request workflow | ✅ | ✅ |
| Approval / Rejection Workflow | Formal pass/fail decision on application | ✅ | ✅ |
| PDF Summary Export | Full application pack exported as PDF | ✅ | ✅ |
| CreditSafe Search Integration | Live company credit search during onboarding | ✅ | ✅ |
| Dealer Enrichment Panel | Auto-populate dealer data from external sources | ✅ | ✅ |
| Database Persistence (auto-save) | Debounced save of checklist progress to backend | ✅ | ✅ |
| Demo Onboarding Wizard | Step-by-step guided onboarding demo mode | ✅ | 🔶 Admin only |

---

## MODULE 4: Dealer Detail / Profile

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Dealer Score & RAG Badge | Current compliance score and risk status | ✅ | ✅ |
| Dealer Score Trend Chart | Historical score over time | ✅ | ✅ |
| Audit Section Breakdown Cards | Per-section scores with pass/fail detail | ✅ | ✅ |
| Key Actions Table | Outstanding compliance actions with status | ✅ | ✅ |
| Action Status Chart | Visual breakdown of open/in-progress/closed actions | ✅ | ✅ |
| Controls Breakdown Chart | Control-level compliance visualisation | ✅ | ✅ |
| Section Radar Chart | Multi-axis compliance radar per audit section | ✅ | ✅ |
| AI Audit Summary | AI-generated plain-language audit narrative | ✅ | ✅ |
| Batch AI Summary | AI summary across multiple audit sections | ✅ | ✅ |
| Report Summary Card | Condensed reportable summary | ✅ | ✅ |
| CreditSafe Card | Live credit risk data panel | ✅ | ✅ |
| FCA Register Card | FCA authorisation status lookup | ✅ | ✅ |
| Director Passport Check | Identity verification panel for directors | ✅ | ✅ |
| Phoenixing Analysis | Detection of phoenix company risk patterns | ✅ | ✅ |
| Customer Sentiment Card | CSS score with gauge visualisation | ✅ | ✅ |
| Sentiment Gauge | Visual dial for customer sentiment score | ✅ | ✅ |
| Dealer Recheck Timeline | Historical recheck log with dates and notes | ✅ | ✅ |
| Dealer Notes | Free-text notes persisted per dealer | ✅ | ✅ |
| Dealer Documents Panel | Document list and upload per dealer | ✅ | ✅ |
| Duplicate Flags Banner | Alert when potential duplicate dealer detected | ✅ | ✅ |
| PDF Dealer Report Export | Full dealer profile exported as PDF | ✅ | ✅ |

---

## MODULE 5: Documents

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Global Document Library | All documents across all dealers in one view | ✅ | ✅ |
| Document Upload | Upload files against a dealer record | ✅ | ✅ |
| Document Categories & Tags | Categorisation and tagging of documents | ✅ | ✅ |
| Expiry Date Tracking | Flag documents approaching or past expiry | ✅ | ✅ |
| Document Search & Filter | Search by dealer, category, tag, or status | ✅ | ✅ |

---

## MODULE 6: Alerts

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Alert Feed | List of system-generated compliance alerts | ✅ | ✅ |
| Alert Threshold Settings | Configurable score drop and action triggers | ✅ | 🔶 Admin only |
| Notification Preferences | In-app and email notification settings | ✅ | ✅ |
| In-App Notifications Dropdown | Real-time notification bell in header | ✅ | ✅ |

---

## MODULE 7: Reports

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Reports Dashboard | Summary of available reports | ✅ | ✅ |
| PDF Report Export | Export compliance reports as PDF | ✅ | ✅ |
| Audit Framework Data | Structured audit data model underpinning all reports | ✅ | ✅ |

---

## MODULE 8: Comparison Tool

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Multi-Dealer Comparison | Side-by-side dealer compliance comparison | ✅ | ✅ |
| Comparison Bar Chart | Score comparison bar chart | ✅ | ✅ |
| Comparison Radar Chart | Multi-axis radar comparison | ✅ | ✅ |
| Comparison KPIs | Key metrics across selected dealers | ✅ | ✅ |
| Comparison Table | Structured data table | ✅ | ✅ |
| Comparison PDF Export | Export comparison view as PDF | ✅ | ✅ |

---

## MODULE 9: Trends

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Portfolio Trend Chart | Long-run portfolio score trend | ✅ | ✅ |
| RAG Distribution Chart | Historical RAG split over time | ✅ | ✅ |
| Dealer Trend Chart | Individual dealer trend drill-down | ✅ | ✅ |
| Movers Table | Biggest improvers and decliners | ✅ | ✅ |
| Trend KPIs | Key trend metrics (avg, high, low, delta) | ✅ | ✅ |
| Trend PDF Export | Export trend analysis as PDF | ✅ | ✅ |

---

## MODULE 10: Do Not Deal (Banned List)

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Banned Entity Registry | List of entities flagged as Do Not Deal | ✅ | ✅ |
| Add to Banned List | Flag a dealer/director as banned with reason | 🔶 Request only | ✅ Full control |
| Failed Checks Log | Record of which checks triggered the ban | ✅ | ✅ |
| Ban Reason & Notes | Documented rationale | ✅ Read | ✅ Write |

---

## MODULE 11: Settings

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| General Settings | Region, date format, theme | ✅ | ✅ |
| Display Settings | Compact mode, animations | ✅ | ✅ |
| Alert Thresholds | Score drop trigger, overdue action trigger | ✅ | ✅ |
| Notification Settings | Email/in-app preferences per event type | ✅ | ✅ |
| RAG Threshold Configuration | Green/Amber score boundaries | 🔶 View only | ✅ Full control |
| CSS Oversight/Reward Thresholds | CSS score boundary settings | 🔶 View only | ✅ Full control |

---

## MODULE 12: Authentication & Navigation

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| Email/Password Authentication | Sign in / sign out | ✅ | ✅ |
| Auth Context & Protected Routes | Route-level access control | ✅ | ✅ |
| Global Search | Search dealers, documents, alerts | ✅ | ✅ |
| Responsive Sidebar Navigation | Desktop sidebar + mobile drawer | ✅ | ✅ |
| User Profile Dropdown | User info and sign out | ✅ | ✅ |
| Dark / Light Theme | Theming with system preference support | ✅ | ✅ |

---

## MODULE 13: External Integrations (Backend Functions)

| Feature | Description | Lender Portal | Oversight Panel |
|---|---|---|---|
| FCA Register Lookup | Live FCA authorisation check via edge function | ✅ | ✅ |
| CreditSafe Integration | Company credit score via edge function | ✅ | ✅ |
| Companies House Lookup | Company registration data | ✅ | ✅ |
| Director Passport API | Identity verification integration | ✅ | ✅ |
| AI Audit Summary Generation | GPT-powered audit narrative via edge function | ✅ | ✅ |
| QA Health Check | System health monitoring endpoint | ❌ | ✅ Admin only |

---

## MVP vs Future Phase Recommendations

### MVP — Lender-Facing Portal
- Dashboard (Portfolio Overview)
- Dealer Detail (Score / RAG / Actions / Documents)
- FCA Register & CreditSafe cards
- Document Library
- Alerts & Notifications
- Authentication & Protected Routes

### MVP — Oversight Panel
- All Lender Portal MVP features
- Full Do Not Deal management (add/edit/remove)
- RAG & CSS threshold configuration
- Onboarding workflow administration
- QA Health Check
- Multi-lender tenancy controls (future hook)

### Phase 2 (Both Portals)
- Trends & Comparison modules
- Pre-Onboarding screening workflow
- Phoenixing Analysis & Director Passport
- Batch AI Summaries

### Phase 3 (Both Portals)
- Advanced reporting suite
- Live data API integrations (real CreditSafe, FCA, Companies House)
- Role-based access control (RBAC) with granular permissions
- Multi-lender tenancy & white-labelling
- Audit trail & activity logging
- SLA tracking & escalation workflows

---

*DealerGuard — Dealer Oversight Platform | The Compliance Guys © 2026*
