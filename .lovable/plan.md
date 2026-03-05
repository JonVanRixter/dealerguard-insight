

## Plan: Surface Policy Documents on TCG Dealer Profile + Lender Documents Tab

### What this achieves
The TCG dealer profile will display a dedicated **Documents** tab showing all 26 policy documents from the onboarding audit -- clearly indicating which documents were uploaded and which are missing. The Lender Profile's Documents tab will be upgraded to show the same policy document data (filtered to that lender's dealers), following the `lenderReportSurface.json` rules: lenders see policy name, existence status, last updated date, and whether a document is available -- but not the actual files. This creates the foundation for a future "Request Document" flow between the Lender Portal and Klassify Pro.

### Changes

**1. Add "Documents" tab to TCG Dealer Detail (`src/pages/TcgDealerDetail.tsx`)**
- Add a 4th tab: `Documents` (with `FileText` icon) alongside Overview, Policies, External Checks.
- Create a new component `src/components/tcg-dealer/DealerDocumentsTab.tsx` that:
  - Takes the `DealerPolicyRecord` (or null) as a prop.
  - Groups policies by category (same grouping as PolicyTab).
  - Each row shows: policy name, existence status (Yes/No pill), document status (Uploaded with filename + view icon, or "Not uploaded" with amber warning), last updated date.
  - Summary strip at top: X documents uploaded, Y missing, Z policies not in place.
  - For dealers without a policy record, show an empty state: "No onboarding documents recorded for this dealer."
  - Clean card-based layout with collapsible category groups matching the existing PolicyTab aesthetic.

**2. Upgrade Lender Profile Documents Tab (`src/pages/LenderProfile.tsx`)**
- Replace the current placeholder documents table (lines 482-538) with a proper policy-document view.
- For each dealer under this lender, look up `getPolicyRecord(dealerId)`.
- Display a per-dealer accordion/card showing:
  - Dealer name as header with summary counts (e.g., "14/22 documents available").
  - Inside: policy rows with columns: Policy Name, Exists, Document Available (Yes/No -- not the file), Last Updated.
  - Where no document exists: show "No document" in muted text.
  - Where no policy record exists for a dealer: show "Onboarding documents pending" message.
- Add a read-only tooltip note: "To request a copy of a policy document, contact TCG directly."
- Maintain the existing `Lock` read-only badge in the tab header.

**3. Data flow**
- Both views consume `getPolicyRecord()` from `src/data/tcg/dealerPolicies.ts` -- no new data files needed.
- For dealers that don't have explicit policy records (d012-d038 and generated dealers), the components will show an appropriate "No documents recorded" state.

### Technical details

- `DealerDocumentsTab` component: ~120 lines, reuses `ExistsPill`-style badges, `Collapsible` groups, same grid layout as PolicyTab but read-only (no edit buttons).
- Lender Profile Documents tab: refactor inline JSX (lines 482-538) to iterate over `lenderDealers`, calling `getPolicyRecord()` per dealer, rendering collapsible dealer sections.
- No database changes required -- all data comes from the existing mock policy framework.

