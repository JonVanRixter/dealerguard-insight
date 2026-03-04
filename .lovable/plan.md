

## Plan: Phase 1 Manual-Entry Data Source Model for Onboarding

### What this achieves
Every external data field in the onboarding workflow gets a `source` property (`"api"`, `"manual"`, or `"pending_automation"`) tracked in the data model. In Phase 1, all fields default to `"pending_automation"`. When TCG staff manually enters a value, the source flips to `"manual"`. When the simulated external checks run, the source becomes `"api"`. The UI shows a subtle inline indicator next to each field label so TCG staff know which fields are automated vs manual vs waiting, without cluttering the form. This ensures the audit trail is clean from day one and the transition to full automation is seamless.

### Changes

**1. Extend data model (`src/hooks/useTcgOnboarding.ts`)**
- Add `source: "api" | "manual" | "pending_automation"` to `PreScreenCheck` interface (default: `"pending_automation"`)
- Add `source` to `PolicyEntry` interface (default: `"pending_automation"`)
- Add `source` to each field group in `TcgOnboardingApp`: new property `fieldSources: Record<string, "api" | "manual" | "pending_automation">` tracking company name, CH number, address fields, contact fields, etc. Default all to `"pending_automation"`
- In `updateCurrent`, when a basic field changes and was previously empty, auto-set its source to `"manual"`
- Update `defaultPreScreenChecks` to include `source: "pending_automation"`
- Update `buildEmptyPolicies` to include `source: "pending_automation"`

**2. Create source indicator component (`src/components/tcg-onboarding/FieldSourceIndicator.tsx`)**
- Tiny inline component (~30 lines) that renders next to field labels
- `"api"`: green dot + "API" text (when automated check has populated)
- `"manual"`: blue dot + "Manual" text (TCG staff typed it)
- `"pending_automation"`: amber dot + "Manual (Phase 1)" text with a tooltip: "This field will be automated via API in a future release"
- All rendered at `text-[10px]` size, non-intrusive, consistent with platform aesthetic

**3. Update Stage 1 form (`src/components/tcg-onboarding/OnboardingStage1.tsx`)**
- Import `FieldSourceIndicator`
- Next to each form field label (Company Name, CH Number, Trading Name, etc.), render the indicator using `app.fieldSources[fieldKey]`
- Group the "External Checks" section with a small info banner: "In Phase 1, external checks are simulated. TCG staff can manually enter results where automation is not yet live."
- Pre-screen checks: show source indicator next to each check label

**4. Update RunExternalChecks (`src/components/tcg-onboarding/RunExternalChecks.tsx`)**
- When simulated checks complete and auto-populate pre-screen results, set each check's `source` to `"api"`
- When pre-filling form fields from Companies House data, set those field sources to `"api"`

**5. Update Stage 2 form (`src/components/tcg-onboarding/OnboardingStage2.tsx`)**
- Show `FieldSourceIndicator` next to each policy name
- When TCG staff changes a policy's `exists` value, set `source` to `"manual"`

**6. Update Stage 3 review (`src/components/tcg-onboarding/OnboardingStage3.tsx`)**
- In the read-only review, show source indicators so the approver can see which data was API-sourced vs manually entered
- Add a summary count at the top of the review: "X fields via API, Y fields manual, Z fields pending"

### Technical details
- `FieldSourceIndicator` is a pure presentational component: `({ source }: { source: "api" | "manual" | "pending_automation" }) => JSX`
- `fieldSources` is a flat `Record<string, Source>` with keys like `"companyName"`, `"companiesHouseNumber"`, `"addressStreet"`, etc.
- No database changes needed -- all data is in the client-side onboarding state
- The source tracking is internal to the data model; badges are subtle and don't change the form interaction pattern

