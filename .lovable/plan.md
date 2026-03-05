

## Plan: Replace "Ready to Transfer" with "Complete" Auto-Transition

When all 32 checks + all 22 policies are answered, the application automatically moves to "Complete" status — no manual transfer step needed. Complete applications represent dealers ready for the portfolio.

### Changes

**1. Data model (`src/data/tcg/onboardingApplications.ts`)**
- Change `OnboardingAppStatus` type: replace `"Ready to Transfer"` with `"Complete"`
- Remove `readyToTransfer` from `CompletionStatus` interface
- Update `buildCompletion` to drop the `readyToTransfer` parameter
- Update APP-003 and APP-007 seeder data: status → `"Complete"`, history entries updated

**2. Hook (`src/hooks/useTcgOnboarding.ts`)**
- Remove `markReadyToTransfer` function entirely
- In `updateCurrent`: after recomputing completion, auto-set `status = "Complete"` when `onboardingComplete` is true
- Remove `readyToTransfer` from completion computation

**3. App Detail (`src/pages/TcgAppDetail.tsx`)**
- Remove `handleMarkReady`, `canMarkReady`, and the "Mark as Ready to Transfer" button from header
- Remove the bottom "Mark as Ready to Transfer" banner in policies stage
- Remove the "Already marked ready" badge
- Update status badge colors: replace `"Ready to Transfer"` references with `"Complete"`
- When all checks + policies are answered, auto-update status to "Complete" and show a success banner (read-only, no action button)
- Update the stage stepper "both complete" message to say "Complete — added to Dealer Portfolio"

**4. Onboarding Hub (`src/pages/TcgOnboardingHub.tsx`)**
- Rename 4th board column: `"✅ Ready to Transfer"` → `"✅ Complete"`
- Update column filter: `ready: active.filter(a => a.status === "Complete")`
- Replace `ReadyCard` component: remove "Mark as Transferred" button, show a simple complete card
- Remove transfer confirmation dialog and all `transferApp`/`transferredIds` state
- Update KPI card: "Ready to Transfer" → "Complete"
- Update `statusBadge` mapping
- Remove `Send` icon import if no longer used
- In list view, remove the Transfer button for complete apps

**5. Workflow page (`src/pages/TcgOnboardingWorkflow.tsx`)**
- Remove `markReadyToTransfer` usage and `handleMarkReady`
- Remove the toast about "Ready to Transfer"

**6. Other references**
- `src/pages/PreOnboarding.tsx`: Update status color mapping and filters from `"Ready to Transfer"` to `"Complete"`
- `src/components/dashboard/OnboardingValidityWidget.tsx`: Update status filter references
- `src/components/tcg-onboarding/StageIndicator.tsx`: Update the "ready to transfer" message to "Complete"

