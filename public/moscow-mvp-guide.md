# Klassify Pro — TCG Oversight Platform
## MoSCoW Prioritisation Guide for MVP Delivery

**Document Version:** 1.0  
**Date:** 5 March 2026  
**Scope:** TCG Oversight Panel (internal compliance operations platform)  
**Audience:** Internal development team  
**Format:** Current state audit + MVP gap analysis

---

## How to Read This Document

Each feature is tagged with its **current state**:

| Tag | Meaning |
|-----|---------|
| ✅ BUILT | Fully implemented and functional in the current build |
| 🟡 PARTIAL | Some implementation exists but incomplete for production |
| 🔴 NOT BUILT | Not yet implemented — identified as an MVP gap |

---

## MUST HAVE — Core features required for MVP launch

These are non-negotiable for a production release. Without them the platform cannot function as a compliance oversight tool.

---

### M1. Authentication & Access Control

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M1.1 | Email/password authentication (signup + login) | ✅ BUILT | Supabase Auth via `AuthContext`. Email verification enabled. |
| M1.2 | Demo mode bypass for stakeholder previews | ✅ BUILT | `enterDemoMode()` in AuthContext skips auth. |
| M1.3 | Protected route guards | ✅ BUILT | `ProtectedRoute` component wraps all app routes. |
| M1.4 | User profile creation on signup | ✅ BUILT | `handle_new_user()` DB trigger creates profile + settings rows. |
| M1.5 | Role-based access control (RBAC) | 🔴 NOT BUILT | No roles table exists. All authenticated users have identical access. MVP needs at minimum: Admin, Operator, Read-only roles. |
| M1.6 | Multi-tenancy / organisation scoping | 🔴 NOT BUILT | No organisation/tenant model. All data is user-scoped via `user_id` RLS. MVP needs org-level data isolation if multiple TCG teams will use the platform. |
| M1.7 | Password reset flow | 🟡 PARTIAL | Supabase supports it but no UI flow exists for forgot-password. |
| M1.8 | Session timeout / idle logout | 🔴 NOT BUILT | Sessions persist indefinitely via localStorage. |

---

### M2. Dealer Onboarding Pipeline

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M2.1 | 4-stage Kanban pipeline (Draft → Pre-Screen → Policies → Complete) | ✅ BUILT | `TcgOnboardingHub.tsx` — board + list views with column filtering. |
| M2.2 | New application creation | ✅ BUILT | `useTcgOnboarding` hook generates blank apps with 29 checks + 22 policies. |
| M2.3 | Application detail view with inline editing | ✅ BUILT | `TcgAppDetail.tsx` — 674 lines. Dealer details, checks, policies, notes, history. |
| M2.4 | 29 compliance checks across 8 sections | ✅ BUILT | `CHECK_DEFS` in `onboardingApplications.ts`. Findings-based (not pass/fail). |
| M2.5 | 22 policy framework (tri-state Yes/No/NA) | ✅ BUILT | `masterPolicyList` in `dealerPolicies.ts`. 6 categories incl. conditional insurance. |
| M2.6 | Auto-completion (Draft → In Progress → Complete) | ✅ BUILT | `updateCurrent` in hook auto-transitions status based on completion. |
| M2.7 | Stage gating (Pre-Screen must complete before Policies) | ✅ BUILT | Navigation to Stage 2 blocked until all 29 checks answered. |
| M2.8 | Archive with mandatory reason | ✅ BUILT | Archive modal with required reason field + history logging. |
| M2.9 | Application search, filter by assignee/lender/status | ✅ BUILT | Search, assignee, lender, and status dropdowns on hub. |
| M2.10 | Sortable list view with bulk selection | ✅ BUILT | Column sorting, checkbox selection on list view. |
| M2.11 | Application notes & audit history | ✅ BUILT | History array with timestamped entries. Note input on detail page. |
| M2.12 | DND (Do Not Deal) flag derivation | ✅ BUILT | Auto-derived from sanctions checks (s1_c4, s5_c2). Shown on cards. |
| M2.13 | **Database persistence for onboarding applications** | 🟡 PARTIAL | `onboarding_applications` table exists with RLS but the TCG onboarding pipeline uses **in-memory seeder data** (`seederApplications`). New apps created via `useTcgOnboarding` are state-only and lost on refresh. MVP must connect pipeline CRUD to the database. |
| M2.14 | Insurance policy conditional display | ✅ BUILT | Insurance section hidden when `distributeInsurance === false`. |
| M2.15 | Validation — finding required before marking check complete | ✅ BUILT | Inline validation error if finding is empty when toggling answered. |
| M2.16 | Completion status computation | ✅ BUILT | `computeCompletion()` tracks checks, policies, details, and overall status. |

---

### M3. Dealer Portfolio (Post-Onboarding)

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M3.1 | Dealer directory with search + pagination | ✅ BUILT | `Index.tsx` (dashboard) + `Dealers` page. Uses mock `tcgDealers` data. |
| M3.2 | Dealer profile with tabbed layout (Overview, Policies, Checks, Documents) | ✅ BUILT | `TcgDealerDetail.tsx` — 4 tabs. |
| M3.3 | Policy audit view per dealer (read-only) | ✅ BUILT | `PolicyTab` component shows grouped policies with existence status. |
| M3.4 | External checks tab (Companies House, FCA, CreditSafe) | ✅ BUILT | `ExternalChecksTab` shows simulated re-check results. |
| M3.5 | Documents tab (policy document inventory) | ✅ BUILT | `DealerDocumentsTab` shows uploaded/missing status per policy category. |
| M3.6 | Onboarding validity tracking (92-day window) | ✅ BUILT | `validUntil`, days remaining, expiry badge on dealer overview. |
| M3.7 | Lender association per dealer | ✅ BUILT | `lendersUsing` array on each dealer. Displayed as badges. |
| M3.8 | **Database persistence for dealer portfolio** | 🔴 NOT BUILT | All dealer data is static mock in `src/data/tcg/dealers.ts`. MVP needs dealer records in the database, linked to completed onboarding applications. |
| M3.9 | Score and trend tracking | ✅ BUILT | Score, trend direction, last audit date on each dealer. Mock data. |

---

### M4. External Integrations (API Checks)

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M4.1 | Companies House lookup | 🟡 PARTIAL | Edge function `companies-house/index.ts` exists with JWT auth + input validation. Onboarding uses **simulated data** from `externalChecks.json`. |
| M4.2 | FCA Register lookup | 🟡 PARTIAL | Edge function `fca-register/index.ts` exists. Onboarding uses simulated data. |
| M4.3 | CreditSafe lookup | 🟡 PARTIAL | Edge function `creditsafe/index.ts` exists. Onboarding uses simulated data. |
| M4.4 | Auto-population of pre-screen checks from API results | ✅ BUILT | `RunExternalChecks` component maps API results to check findings (s1_c1, s2_c1, s1_c4). |
| M4.5 | Form pre-fill from Companies House data | ✅ BUILT | Company name + registered address populated from CH response. |
| M4.6 | Flag escalation to Review Queue from check results | ✅ BUILT | "Add to Manual Review Queue" button on flagged CreditSafe/FCA results. |
| M4.7 | **Live API integration (replace simulated data)** | 🔴 NOT BUILT | All three integrations currently use `externalChecks.json` mock data in the onboarding workflow. Edge functions exist but are not called from the onboarding flow. API keys are configured as secrets. |
| M4.8 | Re-check capability on dealer profile | ✅ BUILT | Simulated 1.5s delay re-check with "Last checked" metadata update. |

---

### M5. Lender Management

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M5.1 | Lender directory with search, sort, card/table views | ✅ BUILT | `LenderDirectory.tsx` — 343 lines. KPI tiles, search, sortable columns. |
| M5.2 | Lender profile with tabs (Overview, Dealers, Activity, Documents) | ✅ BUILT | `LenderProfile.tsx` — 739 lines. Comprehensive profile page. |
| M5.3 | Lender team member listing | ✅ BUILT | Team tab shows members with roles, status, last login. |
| M5.4 | Lender activity trail | ✅ BUILT | Recent activity entries shown on profile. |
| M5.5 | TCG internal notes on lender profiles | ✅ BUILT | Note modal + note history. State-only (not persisted to DB). |
| M5.6 | Lender impersonation mode (preview lender view) | ✅ BUILT | "Preview Lender View" toggle banner. UI simulation only. |
| M5.7 | Lender deactivation with reason | ✅ BUILT | Deactivation dialog with mandatory reason. State-only. |
| M5.8 | Policy document visibility surface (read-only for lenders) | ✅ BUILT | Lender Documents tab shows per-dealer policy availability. No file access. |
| M5.9 | **Database persistence for lender data** | 🔴 NOT BUILT | All lender data is static mock in `src/data/tcg/lenders.ts`. |

---

### M6. Dashboard & Reporting

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M6.1 | Main dashboard with KPI tiles | ✅ BUILT | `Index.tsx` — dealer count, lender count, activity feed, score distribution. |
| M6.2 | Portfolio trend mini-chart | ✅ BUILT | `PortfolioTrendMini` widget on dashboard. |
| M6.3 | Top risk dealers widget | ✅ BUILT | `TopRiskDealers` component with score-sorted list. |
| M6.4 | Recheck schedule widget | ✅ BUILT | `RecheckWidget` showing upcoming rechecks. |
| M6.5 | Onboarding validity widget | ✅ BUILT | `OnboardingValidityWidget` with expiry countdown. |
| M6.6 | Schedule health widget | ✅ BUILT | `ScheduleHealthWidget` with check cadence status. |
| M6.7 | Reports & Analytics page (7 modules) | ✅ BUILT | Platform Health KPIs, Growth, Audits, SLA, Onboarding, Alerts, Re-Checks. |
| M6.8 | Report period selector (preset + custom range) | ✅ BUILT | 7 preset periods + custom date range picker. |
| M6.9 | PDF export for reports | ✅ BUILT | `reportsPdfExport.ts` generates downloadable PDF. |
| M6.10 | Section compliance chart | ✅ BUILT | `SectionComplianceChart` radar/bar visualisation. |
| M6.11 | Regional summary table | ✅ BUILT | `RegionalSummaryTable` with region-level aggregation. |
| M6.12 | **Reports backed by real data** | 🔴 NOT BUILT | All report data comes from `reportMetrics.json` mock. |

---

### M7. Do Not Deal (Banned List)

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M7.1 | Banned entity CRUD (add/remove individuals + companies) | ✅ BUILT | `BannedList.tsx` — full CRUD against `banned_entities` table. |
| M7.2 | Entity type filtering (Individual/Company) | ✅ BUILT | Tabbed view by entity type. |
| M7.3 | Failed checks tagging | ✅ BUILT | Multi-select tags for which checks failed. |
| M7.4 | Search banned entities | ✅ BUILT | Search input filtering. |
| M7.5 | Database-backed with RLS | ✅ BUILT | `banned_entities` table with owner-scoped RLS policies. |
| M7.6 | **Cross-reference during onboarding** | 🔴 NOT BUILT | No automated check against banned list during new application creation. Onboarding DND flag is derived from sanctions checks only, not from the banned entities table. |

---

### M8. Manual Review Queue

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M8.1 | Review queue listing with priority sorting | ✅ BUILT | `ReviewQueue.tsx` — sorted by High/Medium/Low priority. |
| M8.2 | Status filtering (Open, In Progress, Resolved) | ✅ BUILT | Status + priority filter dropdowns. |
| M8.3 | Detail modal with notes | ✅ BUILT | Click-to-expand detail dialog. |
| M8.4 | Escalation from external check results | ✅ BUILT | "Add to Review Queue" from flagged CreditSafe/FCA findings. |
| M8.5 | **Database persistence** | 🔴 NOT BUILT | Review queue uses static mock data in `src/data/tcg/reviewQueue.ts`. |
| M8.6 | **Status update persistence** | 🔴 NOT BUILT | Status changes (Open → In Progress → Resolved) are state-only. |

---

### M9. Documents Management

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M9.1 | Document upload with metadata (category, tags, expiry) | ✅ BUILT | `Documents.tsx` uploads to `dealer-documents` storage bucket. |
| M9.2 | Document listing with search + category filter | ✅ BUILT | Filterable table with file preview. |
| M9.3 | Document download + deletion | ✅ BUILT | Download via signed URL, delete with confirmation. |
| M9.4 | Storage bucket with RLS | ✅ BUILT | `dealer-documents` bucket (private). Owner-scoped RLS on metadata table. |
| M9.5 | Dealer-level document inventory (policy docs tab) | ✅ BUILT | `DealerDocumentsTab` shows which policy documents exist per dealer. |

---

### M10. User Settings

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| M10.1 | General settings (region, date format) | ✅ BUILT | `GeneralSettings` component. DB-persisted via `user_settings` table. |
| M10.2 | Notification preferences (email + in-app toggles) | ✅ BUILT | `NotificationSettings` with granular controls. |
| M10.3 | Alert thresholds (score drop, overdue actions) | ✅ BUILT | `AlertThresholds` with numeric inputs. |
| M10.4 | Display settings (theme, compact mode, animations) | ✅ BUILT | `DisplaySettings` with theme toggle (light/dark/system). |
| M10.5 | Settings persistence via Supabase | ✅ BUILT | `useUserSettings` hook with full CRUD against `user_settings` table. |

---

## SHOULD HAVE — Important but not critical for initial launch

These add significant value and should be delivered shortly after (or alongside) MVP if resources allow.

---

### S1. Alerts System

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S1.1 | Alerts listing page with filters | ✅ BUILT | `Alerts.tsx` page exists. |
| S1.2 | Alert generation from check cadence | ✅ BUILT | `auditCheckCadence.ts` generates alerts from schedule data. |
| S1.3 | **Alert persistence + real-time delivery** | 🔴 NOT BUILT | Alerts are computed from static data. No real-time push or DB storage. |
| S1.4 | **Email notification dispatch** | 🔴 NOT BUILT | Notification preferences are stored but no email sending is implemented. |

---

### S2. Dealer Comparison

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S2.1 | Side-by-side dealer comparison (up to 4) | ✅ BUILT | `Comparison.tsx` with radar chart, bar chart, KPI comparison. |
| S2.2 | Comparison table with section breakdown | ✅ BUILT | `ComparisonTable` component. |
| S2.3 | Comparison PDF export | ✅ BUILT | `comparisonPdfExport.ts`. |

---

### S3. Trends & Analytics

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S3.1 | Portfolio trend chart (historical scores) | ✅ BUILT | `PortfolioTrendChart` on Trends page. |
| S3.2 | Dealer-level trend chart | ✅ BUILT | `DealerTrendChart` component. |
| S3.3 | Score distribution chart | ✅ BUILT | `ScoreDistributionChart` on dashboard. |
| S3.4 | Movers table (biggest score changes) | ✅ BUILT | `MoversTable` on Trends page. |
| S3.5 | Trend KPIs | ✅ BUILT | `TrendKPIs` summary cards. |

---

### S4. Schedule Health & Rechecks

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S4.1 | Check schedule health detail page | ✅ BUILT | `ScheduleHealthDetail.tsx` with cadence tracking. |
| S4.2 | Completed rechecks tracking | ✅ BUILT | `completed_rechecks` table with DB persistence + RLS. |
| S4.3 | Recheck scheduling logic | ✅ BUILT | `recheckSchedule.ts` utility. |

---

### S5. Pre-Onboarding (Legacy Flow)

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S5.1 | Pre-onboarding wizard with segmentation | ✅ BUILT | `PreOnboarding.tsx` — 738 lines. Multi-step wizard. |
| S5.2 | CreditSafe search integration | ✅ BUILT | `CreditSafeSearch` component with simulated results. |
| S5.3 | Dealer enrichment engine | ✅ BUILT | `DealerEnrichment` component with FCA/CH/CS enrichment. |
| S5.4 | Onboarding document upload | ✅ BUILT | `OnboardingDocUpload` component. |
| S5.5 | Screening data editor | ✅ BUILT | `ScreeningDataEditor` with field source indicators. |
| S5.6 | DB persistence for pre-onboarding apps | ✅ BUILT | Uses `onboarding_applications` table. |

---

### S6. AI-Powered Features

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S6.1 | AI audit summary generation | ✅ BUILT | `generate-audit-summary` edge function using Lovable AI gateway. |
| S6.2 | Batch AI summary on dealer profile | ✅ BUILT | `BatchAiSummary` component. |
| S6.3 | AI-generated dealer audit narrative | ✅ BUILT | `AiAuditSummary` with markdown rendering. |
| S6.4 | QA health check (automated testing) | ✅ BUILT | `qa-health-check` edge function + `qa_health_checks` DB table. |

---

### S7. Onboarding Enrichment Engine

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| S7.1 | External check orchestration (CH → FCA → CS sequence) | ✅ BUILT | `RunExternalChecks` component with step-by-step progress. |
| S7.2 | Auto-population of findings from API results | ✅ BUILT | Maps CH/FCA/CS results to specific check IDs. |
| S7.3 | Field source indicators (API/Manual/Pending) | ✅ BUILT | `FieldSourceIndicator` component with green/blue/amber badges. |
| S7.4 | **Live enrichment from real APIs** | 🔴 NOT BUILT | Uses `externalChecks.json` simulated data. |

---

## COULD HAVE — Desirable features that enhance the product

These are nice-to-haves for MVP. They improve UX but the platform functions without them.

---

### C1. UI/UX Enhancements

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| C1.1 | Global search across dealers/lenders/applications | ✅ BUILT | `GlobalSearch` component in header. |
| C1.2 | Notifications dropdown | ✅ BUILT | `NotificationsDropdown` in header. |
| C1.3 | Mobile-responsive sidebar | ✅ BUILT | `MobileSidebar` component. |
| C1.4 | Loading skeletons | ✅ BUILT | `DashboardSkeleton` component. |
| C1.5 | Animated counters on KPI tiles | ✅ BUILT | `useAnimatedCounter` hook. |
| C1.6 | Dark mode support | ✅ BUILT | CSS variables with `dark:` variants throughout. |
| C1.7 | Toast notifications | ✅ BUILT | Shadcn toast + Sonner. |
| C1.8 | Duplicate detection across onboarding | ✅ BUILT | `duplicateDetection.ts` utility + `dismissed_duplicates` DB table. |

---

### C2. PDF Exports

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| C2.1 | Dealer profile PDF export | ✅ BUILT | `pdfExport.ts`. |
| C2.2 | Onboarding application PDF export | ✅ BUILT | `onboardingPdfExport.ts`. |
| C2.3 | Comparison PDF export | ✅ BUILT | `comparisonPdfExport.ts`. |
| C2.4 | Trends PDF export | ✅ BUILT | `trendPdfExport.ts`. |
| C2.5 | Reports PDF export | ✅ BUILT | `reportsPdfExport.ts`. |

---

### C3. Dealer Profile Extras

| # | Feature | Current State | Notes |
|---|---------|--------------|-------|
| C3.1 | Dealer notes (DB-backed) | ✅ BUILT | `dealer_notes` table with RLS. `DealerNotes` component. |
| C3.2 | Director passport/ID checks panel | ✅ BUILT | `DirectorPassportCheck` + `DirectorIdChecksPanel`. |
| C3.3 | Customer sentiment card | ✅ BUILT | `CustomerSentimentCard` component. |
| C3.4 | CreditSafe card on dealer profile | ✅ BUILT | `CreditSafeCard` component. |
| C3.5 | Phoenixing analysis | ✅ BUILT | `PhoenixingAnalysis` component. |
| C3.6 | Dealer score trend chart | ✅ BUILT | `DealerScoreTrend` component. |
| C3.7 | Key actions table | ✅ BUILT | `KeyActionsTable` component. |
| C3.8 | Section radar chart | ✅ BUILT | `SectionRadarChart` component. |
| C3.9 | Controls breakdown chart | ✅ BUILT | `ControlsBreakdownChart` component. |
| C3.10 | Recheck timeline | ✅ BUILT | `DealerRecheckTimeline` component. |

---

## WON'T HAVE (this release) — Explicitly out of scope for MVP

These are acknowledged future requirements but are excluded from the initial MVP release.

---

### W1. Lender Portal (Separate Application)

| # | Feature | Notes |
|---|---------|-------|
| W1.1 | Lender-facing login + dashboard | Separate application. Lenders will view their dealer portfolio with TCG-assigned scores. |
| W1.2 | Lender-specific RAG threshold configuration | Lenders apply their own Red/Amber/Green thresholds to TCG scores. |
| W1.3 | Document request workflow (Lender → TCG) | "Request Document" flow between lender portal and Klassify Pro. |
| W1.4 | Lender self-service team management | Lenders manage their own team members and permissions. |

---

### W2. Advanced Compliance Features

| # | Feature | Notes |
|---|---------|-------|
| W2.1 | Automated re-onboarding on 92-day expiry | Auto-trigger re-onboarding when validity window expires. |
| W2.2 | Continuous monitoring / real-time alerts from APIs | Live webhook integration with CH/FCA for change detection. |
| W2.3 | Audit trail immutability (append-only ledger) | Tamper-proof audit log for regulatory evidence. |
| W2.4 | Multi-org support (white-label for other oversight firms) | Full multi-tenancy beyond single TCG instance. |

---

### W3. Infrastructure & DevOps

| # | Feature | Notes |
|---|---------|-------|
| W3.1 | Automated test suite (unit + integration + E2E) | Only `example.test.ts` exists. No meaningful test coverage. |
| W3.2 | CI/CD pipeline with staging environment | No build pipeline configured. |
| W3.3 | Error monitoring (Sentry / equivalent) | No error tracking in production. |
| W3.4 | Performance monitoring + APM | No performance telemetry. |
| W3.5 | Database backup + disaster recovery plan | Handled by Lovable Cloud but no documented DR process. |

---

## MVP Gap Summary

The following items represent the **critical gaps** that must be closed before production launch:

| Priority | Gap | Impact |
|----------|-----|--------|
| 🔴 CRITICAL | **M1.5** — No RBAC | All users have full admin access. Security risk. |
| 🔴 CRITICAL | **M2.13** — Onboarding pipeline not DB-backed | All onboarding work lost on page refresh. Core workflow broken. |
| 🔴 CRITICAL | **M3.8** — Dealer portfolio not DB-backed | Completed onboarding doesn't create persistent dealer records. |
| 🔴 HIGH | **M4.7** — External checks use simulated data | Edge functions exist but aren't wired into the onboarding flow. |
| 🔴 HIGH | **M5.9** — Lender data not DB-backed | Lender management is entirely mock data. |
| 🔴 HIGH | **M8.5** — Review queue not DB-backed | Escalations not persisted. |
| 🔴 HIGH | **M7.6** — No banned list cross-reference during onboarding | DND entities not checked against banned_entities table. |
| 🟡 MEDIUM | **M1.7** — No password reset UI | Users can't recover accounts. |
| 🟡 MEDIUM | **M6.12** — Reports use mock data | All analytics are fabricated. |
| 🟡 MEDIUM | **S1.3** — No real-time alert delivery | Alert system is display-only. |
| 🟡 MEDIUM | **S1.4** — No email notifications | Preferences saved but never acted on. |

---

## Database Schema — Current State

### Tables (production-ready with RLS)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User display names | Owner-scoped |
| `user_settings` | Theme, notifications, thresholds | Owner-scoped |
| `banned_entities` | Do Not Deal list | Creator-scoped |
| `dealer_documents` | Uploaded compliance documents | Owner-scoped |
| `dealer_notes` | Free-text notes on dealers | Owner-scoped |
| `completed_rechecks` | Recheck completion records | Owner-scoped |
| `dismissed_duplicates` | Duplicate detection dismissals | Owner-scoped |
| `onboarding_applications` | Pre-onboarding applications (legacy flow) | Owner-scoped |
| `qa_health_checks` | Automated QA results | Service-role only |

### Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `dealer-documents` | Private | Uploaded policy/compliance documents |

### Edge Functions

| Function | Auth | Purpose |
|----------|------|---------|
| `companies-house` | JWT | Companies House API proxy |
| `fca-register` | JWT | FCA Register API proxy |
| `creditsafe` | JWT | CreditSafe API proxy |
| `generate-audit-summary` | JWT | AI-powered audit narrative generation |
| `qa-health-check` | JWT | Automated platform health diagnostics |

### Configured Secrets

| Secret | Purpose |
|--------|---------|
| `COMPANIES_HOUSE_API_KEY` | CH API authentication |
| `FCA_API_KEY` | FCA Register API authentication |
| `CREDITSAFE_USERNAME` | CreditSafe login |
| `CREDITSAFE_PASSWORD` | CreditSafe login |
| `LOVABLE_API_KEY` | AI gateway access |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + Shadcn UI |
| State | React Query + React hooks |
| Routing | React Router v6 |
| Icons | Lucide React |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Dates | date-fns |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage |
| Serverless | Supabase Edge Functions (Deno) |
| AI | Lovable AI Gateway (Gemini/GPT models) |

---

## Navigation Structure

| Nav Item | Route | Page |
|----------|-------|------|
| Dashboard | `/` | `Index.tsx` |
| Lender Directory | `/tcg/lenders` | `LenderDirectory.tsx` |
| Dealer Portfolio | `/dealers` | `Dealers.tsx` |
| Pre-Onboarding | `/pre-onboarding` | `PreOnboarding.tsx` |
| Onboarding | `/onboarding` | `Onboarding.tsx` |
| Do Not Deal | `/banned-list` | `BannedList.tsx` |
| Review Queue | `/tcg/review-queue` | `ReviewQueue.tsx` |
| Documents | `/documents` | `Documents.tsx` |
| Alerts | `/alerts` | `Alerts.tsx` |
| Reports & Analytics | `/reports` | `Reports.tsx` |
| Comparison | `/comparison` | `Comparison.tsx` |
| Trends | `/trends` | `Trends.tsx` |
| Settings | `/settings` | `Settings.tsx` |

### Sub-routes (not in nav)

| Route | Page |
|-------|------|
| `/tcg/onboarding` | `TcgOnboardingHub.tsx` (Pipeline board) |
| `/tcg/onboarding/new` | `TcgOnboardingWorkflow.tsx` |
| `/tcg/onboarding/:appId` | `TcgAppDetail.tsx` |
| `/tcg/onboarding/:appId/stage-:stage` | `TcgOnboardingWorkflow.tsx` |
| `/tcg/dealers/:id` | `TcgDealerDetail.tsx` |
| `/tcg/lenders/:id` | `LenderProfile.tsx` |
| `/dealer/:name` | `DealerDetail.tsx` |
| `/schedule-health` | `ScheduleHealthDetail.tsx` |
| `/auth` | `Auth.tsx` |

---

*End of document. Generated from codebase analysis on 5 March 2026.*
