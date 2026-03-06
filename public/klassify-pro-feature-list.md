# Klassify Pro — TCG Oversight Platform
## Complete Feature Inventory
> Generated: 6 March 2026 | Build: POC → MVP Transition

---

## Platform Summary

**Klassify Pro** is the internal compliance oversight platform operated by The Compliance Guys (TCG). It manages the full lifecycle of dealer compliance — from initial onboarding and screening through ongoing monitoring, rechecks, and reporting — across a portfolio of motor finance dealers on behalf of lender clients.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + Shadcn UI |
| State Management | React Query + React hooks |
| Routing | React Router v6 |
| Icons | Lucide React |
| Charts | Recharts |
| PDF Generation | jsPDF + jspdf-autotable |
| Date Handling | date-fns |
| Backend | Lovable Cloud (Supabase) |
| Authentication | Supabase Auth (email/password) |
| Database | PostgreSQL (via Supabase) |
| File Storage | Supabase Storage |
| Serverless Functions | Supabase Edge Functions (Deno runtime) |
| AI Integration | Lovable AI Gateway (Google Gemini / OpenAI GPT models) |
| Markdown Rendering | react-markdown |

---

## FRONT-END FEATURES

---

### 1. Authentication & Session Management

| # | Feature | Route / Component | Status |
|---|---------|-------------------|--------|
| 1.1 | Email/password sign-up | `/auth` — `Auth.tsx` | ✅ Built |
| 1.2 | Email/password sign-in | `/auth` — `Auth.tsx` | ✅ Built |
| 1.3 | Email verification (required before sign-in) | Supabase Auth config | ✅ Built |
| 1.4 | Sign-out | `UserProfileDropdown`, `AppSidebar` | ✅ Built |
| 1.5 | Demo mode bypass (stakeholder preview without auth) | `AuthContext.enterDemoMode()` | ✅ Built |
| 1.6 | Protected route guards | `ProtectedRoute` wrapper in `App.tsx` | ✅ Built |
| 1.7 | Auth state context provider | `AuthContext.tsx` | ✅ Built |
| 1.8 | Password reset flow | — | ❌ Not built |
| 1.9 | Session timeout / idle logout | — | ❌ Not built |
| 1.10 | Role-based access control (RBAC) | — | ❌ Not built |
| 1.11 | Multi-tenancy / organisation scoping | — | ❌ Not built |

---

### 2. Navigation & Layout

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 2.1 | Persistent sidebar navigation (desktop) | `AppSidebar.tsx` | ✅ Built |
| 2.2 | Mobile sidebar drawer | `MobileSidebar.tsx` | ✅ Built |
| 2.3 | Active route highlighting | `NavLink.tsx` | ✅ Built |
| 2.4 | Dashboard layout wrapper | `DashboardLayout.tsx` | ✅ Built |
| 2.5 | App header with search + notifications | `AppHeader.tsx` | ✅ Built |
| 2.6 | Global search (dealers, lenders, applications) | `GlobalSearch.tsx` | ✅ Built |
| 2.7 | Notifications dropdown | `NotificationsDropdown.tsx` | ✅ Built |
| 2.8 | User profile dropdown | `UserProfileDropdown.tsx` | ✅ Built |
| 2.9 | Dark / light / system theme toggle | `DisplaySettings.tsx` + CSS variables | ✅ Built |
| 2.10 | Branded logo display | `klassify-pro-logo.png` in sidebar | ✅ Built |

---

### 3. Dashboard (Portfolio Overview)

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 3.1 | Portfolio health donut chart (RAG split) | `ScoreDistributionChart` | ✅ Built |
| 3.2 | Critical alerts KPI tile | `Index.tsx` | ✅ Built |
| 3.3 | Average risk score KPI tile | `Index.tsx` | ✅ Built |
| 3.4 | Portfolio trend mini-chart (12-month rolling) | `PortfolioTrendMini` | ✅ Built |
| 3.5 | Score distribution bar chart | `ScoreDistributionChart` | ✅ Built |
| 3.6 | Section compliance radar/bar chart | `SectionComplianceChart` | ✅ Built |
| 3.7 | Regional summary table | `RegionalSummaryTable` | ✅ Built |
| 3.8 | Top risk dealers widget | `TopRiskDealers` | ✅ Built |
| 3.9 | Recheck schedule widget | `RecheckWidget` | ✅ Built |
| 3.10 | Trend highlights widget (biggest movers) | `TrendHighlightsWidget` | ✅ Built |
| 3.11 | Reports snapshot widget | `ReportsSnapshotWidget` | ✅ Built |
| 3.12 | Onboarding validity widget | `OnboardingValidityWidget` | ✅ Built |
| 3.13 | Schedule health widget | `ScheduleHealthWidget` | ✅ Built |
| 3.14 | Animated KPI counters | `useAnimatedCounter` hook | ✅ Built |
| 3.15 | Dashboard skeleton loader | `DashboardSkeleton` | ✅ Built |
| 3.16 | Dealer watchlist table (paginated, searchable) | `Index.tsx` | ✅ Built |
| 3.17 | Customer sentiment score (CSS) column | Per-dealer CSS indicator | ✅ Built |

---

### 4. Dealer Onboarding Pipeline (TCG Hub)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 4.1 | 4-column Kanban board (Draft, Pre-Screen, Policies, Complete) | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.2 | Collapsible status column headers | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.3 | List view with sortable columns | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.4 | Toggle between board and list views | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.5 | Interactive KPI filter tiles (Drafts, In Progress, Complete, Archived) | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.6 | New application dialog | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.7 | Application search | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.8 | Filter by assignee | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.9 | Filter by requesting lender | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.10 | Filter by status | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.11 | Bulk selection (list view) | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.12 | Application card with completion progress | `TcgOnboardingHub.tsx` | ✅ Built |
| 4.13 | DND (Do Not Deal) flag display on cards | Derived from sanctions checks | ✅ Built |

---

### 5. Onboarding Workflow (2-Stage Process)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 5.1 | Stage 1: Pre-Screen — 29 checks across 8 compliance sections | `OnboardingStage1.tsx` | ✅ Built |
| 5.2 | Stage 2: Policies — 22 compliance policies (Yes/No/NA tri-state) | `OnboardingStage2.tsx` | ✅ Built |
| 5.3 | Stage indicator (visual step tracker) | `StageIndicator.tsx` | ✅ Built |
| 5.4 | Stage gating (all pre-screen checks required before Stage 2) | `TcgOnboardingWorkflow.tsx` | ✅ Built |
| 5.5 | Check ID badges (e.g. S3.C2) | `OnboardingStage1.tsx` | ✅ Built |
| 5.6 | Objective-based guidance per check | `CHECK_DEFS` in `onboardingApplications.ts` | ✅ Built |
| 5.7 | Risk rating indicators (High/Medium) per check | `onboardingApplications.ts` | ✅ Built |
| 5.8 | Finding text entry per check | `OnboardingStage1.tsx` | ✅ Built |
| 5.9 | Inline validation (finding required before marking answered) | `OnboardingStage1.tsx` | ✅ Built |
| 5.10 | Dual progress bar (header + sidebar) | `OnboardingStage1.tsx` | ✅ Built |
| 5.11 | Section progress tracking | `computeSectionProgress()` | ✅ Built |
| 5.12 | Auto-status transitions (Draft → In Progress → Complete) | `useTcgOnboarding` hook | ✅ Built |
| 5.13 | Debounced auto-save (in-memory) | `useTcgOnboarding` hook | ✅ Built |
| 5.14 | Insurance policy conditional display | Hidden when `distributeInsurance === false` | ✅ Built |
| 5.15 | DND flag auto-derivation from sanctions checks (s1_c4, s5_c2) | `useTcgOnboarding` hook | ✅ Built |
| 5.16 | Archive with mandatory reason note | Archive modal + history entry | ✅ Built |
| 5.17 | Application notes | Free-text notes on detail page | ✅ Built |
| 5.18 | Audit history log (timestamped actions) | `history[]` on application model | ✅ Built |

---

### 6. Onboarding Application Detail

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 6.1 | Full application summary view | `TcgAppDetail.tsx` | ✅ Built |
| 6.2 | Dealer details section (name, CH no, address, contact) | `TcgAppDetail.tsx` | ✅ Built |
| 6.3 | Completion status breakdown | `TcgAppDetail.tsx` | ✅ Built |
| 6.4 | Inline editing of all fields | `TcgAppDetail.tsx` | ✅ Built |
| 6.5 | External checks orchestration panel | `RunExternalChecks.tsx` | ✅ Built |
| 6.6 | Companies House data panel | `CompaniesHousePanel.tsx` | ✅ Built |
| 6.7 | FCA Register data panel | `FcaRegisterPanel.tsx` | ✅ Built |
| 6.8 | CreditSafe data panel | `CreditSafePanel.tsx` | ✅ Built |
| 6.9 | Field source indicators (API / Manual / Pending) | `FieldSourceIndicator.tsx` | ✅ Built |
| 6.10 | Auto-population of findings from API results | `RunExternalChecks.tsx` | ✅ Built |
| 6.11 | Form pre-fill from Companies House data | `CompaniesHousePanel.tsx` | ✅ Built |
| 6.12 | Flag escalation to Review Queue | "Add to Review Queue" button | ✅ Built |

---

### 7. Dealer Portfolio (Post-Onboarding)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 7.1 | Dealer directory with search + pagination | `Dealers.tsx` | ✅ Built |
| 7.2 | TCG dealer profile (tabbed layout) | `TcgDealerDetail.tsx` | ✅ Built |
| 7.3 | Overview tab (score, RAG, trend, validity) | `TcgDealerDetail.tsx` | ✅ Built |
| 7.4 | Policies tab (grouped policy audit — read-only) | `PolicyTab.tsx` | ✅ Built |
| 7.5 | External checks tab (CH, FCA, CreditSafe results) | `ExternalChecksTab.tsx` | ✅ Built |
| 7.6 | Documents tab (policy document inventory) | `DealerDocumentsTab.tsx` | ✅ Built |
| 7.7 | Director ID checks panel | `DirectorIdChecksPanel.tsx` | ✅ Built |
| 7.8 | Onboarding validity tracking (92-day window) | Validity badge + days remaining | ✅ Built |
| 7.9 | Lender association badges | `lendersUsing` display | ✅ Built |
| 7.10 | Re-check capability (simulated) | 1.5s delay re-check | ✅ Built |
| 7.11 | Score and trend tracking | Score, trend direction, last audit date | ✅ Built |

---

### 8. Lender-View Dealer Profile

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 8.1 | Dealer score & RAG badge | `DealerDetail.tsx` | ✅ Built |
| 8.2 | Dealer score trend chart | `DealerScoreTrend` | ✅ Built |
| 8.3 | Audit section breakdown cards | `AuditSectionCard` | ✅ Built |
| 8.4 | Key actions table | `KeyActionsTable` | ✅ Built |
| 8.5 | Action status chart | `ActionStatusChart` | ✅ Built |
| 8.6 | Controls breakdown chart | `ControlsBreakdownChart` | ✅ Built |
| 8.7 | Section radar chart | `SectionRadarChart` | ✅ Built |
| 8.8 | AI audit summary (generated narrative) | `AiAuditSummary` | ✅ Built |
| 8.9 | Batch AI summary (multi-section) | `BatchAiSummary` | ✅ Built |
| 8.10 | Report summary card | `ReportSummaryCard` | ✅ Built |
| 8.11 | CreditSafe card | `CreditSafeCard` | ✅ Built |
| 8.12 | FCA Register card | `FcaRegisterCard` | ✅ Built |
| 8.13 | Director passport check | `DirectorPassportCheck` | ✅ Built |
| 8.14 | Phoenixing analysis | `PhoenixingAnalysis` | ✅ Built |
| 8.15 | Customer sentiment card (CSS gauge) | `CustomerSentimentCard` | ✅ Built |
| 8.16 | Dealer recheck timeline | `DealerRecheckTimeline` | ✅ Built |
| 8.17 | Dealer notes (DB-backed) | `DealerNotes` | ✅ Built |
| 8.18 | Dealer documents panel | `DealerDocuments` | ✅ Built |
| 8.19 | Duplicate flags banner | `DuplicateFlagsBanner` | ✅ Built |
| 8.20 | PDF dealer report export | `pdfExport.ts` | ✅ Built |
| 8.21 | Check schedule health | `CheckScheduleHealth` | ✅ Built |

---

### 9. Lender Management

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 9.1 | Lender directory with search + sort | `LenderDirectory.tsx` | ✅ Built |
| 9.2 | Card and table view toggle | `LenderDirectory.tsx` | ✅ Built |
| 9.3 | Lender KPI tiles | `LenderDirectory.tsx` | ✅ Built |
| 9.4 | Lender profile — Overview tab (score distribution, TCG notes) | `LenderProfile.tsx` | ✅ Built |
| 9.5 | Lender profile — Dealers tab | `LenderProfile.tsx` | ✅ Built |
| 9.6 | Lender profile — Activity Log tab | `LenderProfile.tsx` | ✅ Built |
| 9.7 | Lender profile — Documents tab (policy visibility surface) | `LenderProfile.tsx` | ✅ Built |
| 9.8 | Lender profile — Team tab (read-only with lock badge) | `LenderProfile.tsx` | ✅ Built |
| 9.9 | Lender profile — Alerts tab | `LenderProfile.tsx` | ✅ Built |
| 9.10 | TCG internal notes on lender profiles | Note modal + history | ✅ Built |
| 9.11 | Lender impersonation / "View As" mode | Preview toggle banner | ✅ Built |
| 9.12 | Lender deactivation with reason | Deactivation dialog | ✅ Built |

---

### 10. Pre-Onboarding Screening (Legacy Flow)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 10.1 | Pre-onboarding wizard (multi-step) | `PreOnboarding.tsx` | ✅ Built |
| 10.2 | CreditSafe search integration (simulated) | `CreditSafeSearch` | ✅ Built |
| 10.3 | Dealer enrichment engine | `DealerEnrichment` | ✅ Built |
| 10.4 | Onboarding document upload | `OnboardingDocUpload` | ✅ Built |
| 10.5 | Screening data badge | `ScreeningDataBadge` | ✅ Built |
| 10.6 | Screening data editor with field source indicators | `ScreeningDataEditor` | ✅ Built |
| 10.7 | Demo onboarding wizard | `DemoOnboardingWizard` | ✅ Built |
| 10.8 | DB persistence for pre-onboarding applications | `onboarding_applications` table | ✅ Built |

---

### 11. Onboarding Pipeline (Legacy Lender Flow)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 11.1 | Pipeline listing with status cards | `Onboarding.tsx` | ✅ Built |
| 11.2 | Status filtering (Draft, In Progress, Complete) | `Onboarding.tsx` | ✅ Built |
| 11.3 | New application dialog | `Onboarding.tsx` | ✅ Built |
| 11.4 | 8-section compliance checklist | `Onboarding.tsx` | ✅ Built |
| 11.5 | Section progress tracking (X/8) | `Onboarding.tsx` | ✅ Built |
| 11.6 | File uploaders (DBS, Training) | `Onboarding.tsx` | ✅ Built |
| 11.7 | Request more info email template | `Onboarding.tsx` | ✅ Built |
| 11.8 | PDF summary export | `onboardingPdfExport.ts` | ✅ Built |
| 11.9 | DB persistence (debounced auto-save) | `useOnboardingPersistence` hook | ✅ Built |

---

### 12. Do Not Deal (Banned List)

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 12.1 | Banned entity CRUD (add/edit/remove) | `BannedList.tsx` | ✅ Built |
| 12.2 | Entity type tabs (Individual / Company) | `BannedList.tsx` | ✅ Built |
| 12.3 | Failed checks tagging (multi-select) | `BannedList.tsx` | ✅ Built |
| 12.4 | Search banned entities | `BannedList.tsx` | ✅ Built |
| 12.5 | Database-backed with RLS | `banned_entities` table | ✅ Built |
| 12.6 | Cross-reference during onboarding | — | ❌ Not built |

---

### 13. Manual Review Queue

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 13.1 | Review queue listing with priority sorting | `ReviewQueue.tsx` | ✅ Built |
| 13.2 | Status + priority filter dropdowns | `ReviewQueue.tsx` | ✅ Built |
| 13.3 | Detail modal with notes | `ReviewQueue.tsx` | ✅ Built |
| 13.4 | Escalation from external check results | `RunExternalChecks.tsx` | ✅ Built |
| 13.5 | Database persistence | — | ❌ Not built (mock data) |
| 13.6 | Status update persistence | — | ❌ Not built (state only) |

---

### 14. Documents Management

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 14.1 | Document upload with metadata (category, tags, expiry) | `Documents.tsx` | ✅ Built |
| 14.2 | Document listing with search + category filter | `Documents.tsx` | ✅ Built |
| 14.3 | Document download via signed URL | `Documents.tsx` | ✅ Built |
| 14.4 | Document deletion with confirmation | `Documents.tsx` | ✅ Built |
| 14.5 | Expiry date tracking | `Documents.tsx` | ✅ Built |

---

### 15. Alerts

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 15.1 | Alert feed with filters | `Alerts.tsx` | ✅ Built |
| 15.2 | Alert generation from check cadence data | `auditCheckCadence.ts` | ✅ Built |
| 15.3 | In-app notifications dropdown | `NotificationsDropdown.tsx` | ✅ Built |
| 15.4 | Alert persistence + real-time delivery | — | ❌ Not built |
| 15.5 | Email notification dispatch | — | ❌ Not built |

---

### 16. Reports & Analytics

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 16.1 | Reports dashboard (7 modules) | `Reports.tsx` | ✅ Built |
| 16.2 | Platform health KPIs | `PlatformHealthKPIs` | ✅ Built |
| 16.3 | Platform growth module | `PlatformGrowthModule` | ✅ Built |
| 16.4 | Audits completed module | `AuditsCompletedModule` | ✅ Built |
| 16.5 | SLA performance module | `SLAPerformanceModule` | ✅ Built |
| 16.6 | Onboarding metrics module | `OnboardingMetricsModule` | ✅ Built |
| 16.7 | Alert metrics module | `AlertMetricsModule` | ✅ Built |
| 16.8 | Re-check metrics module | `ReCheckMetricsModule` | ✅ Built |
| 16.9 | Insight callout cards | `InsightCallout` | ✅ Built |
| 16.10 | Report period selector (7 presets + custom range) | `Reports.tsx` | ✅ Built |
| 16.11 | Custom tooltip for charts | `ReportChartTooltip` | ✅ Built |
| 16.12 | Reports PDF export | `reportsPdfExport.ts` | ✅ Built |
| 16.13 | Reports backed by real data | — | ❌ Not built (mock data) |

---

### 17. Dealer Comparison

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 17.1 | Multi-dealer comparison (up to 4) | `Comparison.tsx` | ✅ Built |
| 17.2 | Comparison bar chart | `ComparisonBarChart` | ✅ Built |
| 17.3 | Comparison radar chart | `ComparisonRadar` | ✅ Built |
| 17.4 | Comparison KPI summary | `ComparisonKPIs` | ✅ Built |
| 17.5 | Comparison data table | `ComparisonTable` | ✅ Built |
| 17.6 | Comparison header with dealer selectors | `ComparisonHeader` | ✅ Built |
| 17.7 | Comparison PDF export | `comparisonPdfExport.ts` | ✅ Built |

---

### 18. Trends

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 18.1 | Portfolio trend chart (historical scores) | `PortfolioTrendChart` | ✅ Built |
| 18.2 | RAG distribution chart (historical RAG split) | `RagDistributionChart` | ✅ Built |
| 18.3 | Dealer-level trend chart | `DealerTrendChart` | ✅ Built |
| 18.4 | Movers table (biggest improvers + decliners) | `MoversTable` | ✅ Built |
| 18.5 | Trend KPIs (avg, high, low, delta) | `TrendKPIs` | ✅ Built |
| 18.6 | Trends PDF export | `trendPdfExport.ts` | ✅ Built |

---

### 19. Schedule Health & Rechecks

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 19.1 | Check schedule health detail page | `ScheduleHealthDetail.tsx` | ✅ Built |
| 19.2 | Completed rechecks tracking (DB-backed) | `useCompletedRechecks` hook | ✅ Built |
| 19.3 | Recheck scheduling logic | `recheckSchedule.ts` | ✅ Built |

---

### 20. User Settings

| # | Feature | Component / Route | Status |
|---|---------|-------------------|--------|
| 20.1 | General settings (region, date format) | `GeneralSettings` | ✅ Built |
| 20.2 | Display settings (theme, compact mode, animations) | `DisplaySettings` | ✅ Built |
| 20.3 | Alert threshold settings (score drop, overdue actions) | `AlertThresholds` | ✅ Built |
| 20.4 | Notification preferences (email + in-app toggles) | `NotificationSettings` | ✅ Built |
| 20.5 | Settings persistence to database | `useUserSettings` hook | ✅ Built |

---

### 21. UI Components & Shared Utilities

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 21.1 | RAG badge (Green/Amber/Red) | `RagBadge` | ✅ Built |
| 21.2 | Score badge | `ScoreBadge` | ✅ Built |
| 21.3 | Animated counters hook | `useAnimatedCounter` | ✅ Built |
| 21.4 | Duplicate detection utility | `duplicateDetection.ts` | ✅ Built |
| 21.5 | Dismissed duplicates persistence | `useDismissedDuplicates` hook | ✅ Built |
| 21.6 | Toast notifications (Shadcn + Sonner) | `Toaster`, `Sonner` | ✅ Built |
| 21.7 | Full Shadcn UI component library (40+ components) | `src/components/ui/*` | ✅ Built |

---

## BACK-END FEATURES

---

### 22. Database Tables

| # | Table | Purpose | RLS | Status |
|---|-------|---------|-----|--------|
| 22.1 | `profiles` | User display names, created on signup | Owner-scoped | ✅ Built |
| 22.2 | `user_settings` | Theme, notifications, thresholds, display prefs | Owner-scoped | ✅ Built |
| 22.3 | `banned_entities` | Do Not Deal list (individuals + companies) | Creator-scoped | ✅ Built |
| 22.4 | `dealer_documents` | Uploaded compliance document metadata | Owner-scoped | ✅ Built |
| 22.5 | `dealer_notes` | Free-text notes attached to dealers | Owner-scoped | ✅ Built |
| 22.6 | `completed_rechecks` | Recheck completion records | Owner-scoped | ✅ Built |
| 22.7 | `dismissed_duplicates` | Duplicate detection dismissal records | Owner-scoped | ✅ Built |
| 22.8 | `onboarding_applications` | Pre-onboarding applications (legacy lender flow) | Owner-scoped | ✅ Built |
| 22.9 | `qa_health_checks` | Automated QA diagnostic results | Service-role only | ✅ Built |
| 22.10 | TCG onboarding applications table | TCG pipeline applications (29 checks + 22 policies) | — | ❌ Not built (in-memory only) |
| 22.11 | Dealers table | Persistent dealer records post-onboarding | — | ❌ Not built (static mock data) |
| 22.12 | Lenders table | Lender organisation records | — | ❌ Not built (static mock data) |
| 22.13 | Review queue table | Manual review items with status tracking | — | ❌ Not built (static mock data) |
| 22.14 | User roles table (RBAC) | Role assignments (Admin, Operator, Read-only) | — | ❌ Not built |
| 22.15 | Alerts table | Persistent alert records with delivery status | — | ❌ Not built |

---

### 23. Database Triggers & Functions

| # | Feature | Purpose | Status |
|---|---------|---------|--------|
| 23.1 | `handle_new_user()` trigger | Auto-creates `profiles` + `user_settings` rows on signup | ✅ Built |
| 23.2 | `has_role()` security definer function | RBAC role check function | ❌ Not built |

---

### 24. Storage Buckets

| # | Bucket | Access | Purpose | Status |
|---|--------|--------|---------|--------|
| 24.1 | `dealer-documents` | Private | Uploaded compliance/policy documents | ✅ Built |

---

### 25. Edge Functions (Serverless)

| # | Function | Auth | Purpose | Status |
|---|----------|------|---------|--------|
| 25.1 | `companies-house` | JWT | Companies House API proxy (company lookup) | ✅ Built |
| 25.2 | `fca-register` | JWT | FCA Register API proxy (authorisation check) | ✅ Built |
| 25.3 | `creditsafe` | JWT | CreditSafe API proxy (credit score lookup) | ✅ Built |
| 25.4 | `generate-audit-summary` | JWT | AI-powered audit narrative generation (via Lovable AI Gateway) | ✅ Built |
| 25.5 | `qa-health-check` | JWT | Automated platform health diagnostics | ✅ Built |

---

### 26. Configured Secrets

| # | Secret | Purpose | Status |
|---|--------|---------|--------|
| 26.1 | `COMPANIES_HOUSE_API_KEY` | Companies House API authentication | ✅ Configured |
| 26.2 | `FCA_API_KEY` | FCA Register API authentication | ✅ Configured |
| 26.3 | `CREDITSAFE_USERNAME` | CreditSafe API login | ✅ Configured |
| 26.4 | `CREDITSAFE_PASSWORD` | CreditSafe API login | ✅ Configured |
| 26.5 | `LOVABLE_API_KEY` | Lovable AI Gateway access | ✅ Configured |

---

### 27. Data Layer — Mock/Static (Not Yet DB-Backed)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 27.1 | `src/data/tcg/dealers.ts` | TCG dealer portfolio (static) | 🟡 Mock data |
| 27.2 | `src/data/tcg/lenders.ts` | Lender organisations (static) | 🟡 Mock data |
| 27.3 | `src/data/tcg/reviewQueue.ts` | Review queue items (static) | 🟡 Mock data |
| 27.4 | `src/data/tcg/externalChecks.json` | Simulated CH/FCA/CS API responses | 🟡 Mock data |
| 27.5 | `src/data/tcg/reportMetrics.json` | Report analytics data (static) | 🟡 Mock data |
| 27.6 | `src/data/tcg/auditCheckSchedule.json` | Check cadence schedule (static) | 🟡 Mock data |
| 27.7 | `src/data/tcg/cadenceAlerts.json` | Alert generation data (static) | 🟡 Mock data |
| 27.8 | `src/data/tcg/dealerCheckStatus.json` | Dealer check status data (static) | 🟡 Mock data |
| 27.9 | `src/data/tcg/lenderReportSurface.json` | Lender report surface data (static) | 🟡 Mock data |
| 27.10 | `src/data/tcg/onboardingApplications.ts` | TCG onboarding seeder data + type defs | 🟡 Mock data (types are production-ready) |
| 27.11 | `src/data/tcg/dealerPolicies.ts` | Master policy list (22 policies) | ✅ Production-ready reference data |
| 27.12 | `src/data/tcg/seedGenerator.ts` | Seeder data generator for pipeline | 🟡 Dev utility |
| 27.13 | `src/data/dealers.ts` | Lender-view dealer data (static) | 🟡 Mock data |
| 27.14 | `src/data/trendData.ts` | Historical trend data (static) | 🟡 Mock data |
| 27.15 | `src/data/auditFramework.ts` | Audit framework definition | ✅ Production-ready reference data |

---

## NAVIGATION MAP

### Primary Navigation (Sidebar)

| Nav Item | Route | Page Component |
|----------|-------|----------------|
| Dashboard | `/` | `Index.tsx` |
| Lender Directory | `/tcg/lenders` | `LenderDirectory.tsx` |
| Dealer Portfolio | `/dealers` | `Dealers.tsx` |
| Pre‑Onboarding | `/pre-onboarding` | `PreOnboarding.tsx` |
| Onboarding | `/onboarding` | `Onboarding.tsx` |
| Do Not Deal | `/banned-list` | `BannedList.tsx` |
| Review Queue | `/tcg/review-queue` | `ReviewQueue.tsx` |
| Documents | `/documents` | `Documents.tsx` |
| Alerts | `/alerts` | `Alerts.tsx` |
| Reports & Analytics | `/reports` | `Reports.tsx` |
| Comparison | `/comparison` | `Comparison.tsx` |
| Trends | `/trends` | `Trends.tsx` |
| Settings | `/settings` | `Settings.tsx` |

### Sub-Routes (Not in Sidebar)

| Route | Page Component | Purpose |
|-------|----------------|---------|
| `/auth` | `Auth.tsx` | Login / signup |
| `/tcg/onboarding` | `TcgOnboardingHub.tsx` | Onboarding pipeline (Kanban + list) |
| `/tcg/onboarding/new` | `TcgOnboardingWorkflow.tsx` | New application workflow |
| `/tcg/onboarding/:appId` | `TcgAppDetail.tsx` | Application detail view |
| `/tcg/onboarding/:appId/stage-:stage` | `TcgOnboardingWorkflow.tsx` | Stage-specific workflow |
| `/tcg/dealers/:id` | `TcgDealerDetail.tsx` | TCG dealer profile |
| `/tcg/lenders/:id` | `LenderProfile.tsx` | Lender profile |
| `/dealer/:name` | `DealerDetail.tsx` | Lender-view dealer profile |
| `/schedule-health` | `ScheduleHealthDetail.tsx` | Check schedule detail |

---

## PDF EXPORT CAPABILITIES

| # | Export | Utility File | Status |
|---|-------|-------------|--------|
| 1 | Dealer profile report | `pdfExport.ts` | ✅ Built |
| 2 | Onboarding application pack | `onboardingPdfExport.ts` | ✅ Built |
| 3 | Dealer comparison report | `comparisonPdfExport.ts` | ✅ Built |
| 4 | Trends analysis report | `trendPdfExport.ts` | ✅ Built |
| 5 | Reports & analytics export | `reportsPdfExport.ts` | ✅ Built |

---

## FEATURE COUNT SUMMARY

| Category | Built | Not Built | Total |
|----------|-------|-----------|-------|
| Front-End Features | ~160 | ~8 | ~168 |
| Database Tables | 9 | 6 | 15 |
| Edge Functions | 5 | 0 | 5 |
| Storage Buckets | 1 | 0 | 1 |
| Secrets | 5 | 0 | 5 |
| PDF Exports | 5 | 0 | 5 |
| Mock Data Files (to replace) | — | 15 | 15 |

---

## RELATED DOCUMENTATION

| Document | Path |
|----------|------|
| MoSCoW Prioritisation Guide | `public/moscow-mvp-guide.md` |
| DealerGuard Feature Export (legacy POC) | `public/dealerguard-feature-export.md` |
| Onboarding Export | `public/onboarding-export.md` |

---

*Klassify Pro — TCG Oversight Platform | The Compliance Guys © 2026*
*Generated from full codebase analysis on 6 March 2026*
