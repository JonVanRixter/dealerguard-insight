

## Fix: Bridge the Height Gap by Expanding Report Summary Header

### Problem
The left column's two stacked cards are slightly shorter than the Report Summary table, and the current `h-0 min-h-full overflow-hidden` approach forces a hard clip on the Action Status card, making it look "squared off" and unnatural.

### Approach
Instead of forcing the left column to clip, increase the Report Summary table's header area to naturally grow taller and bridge the small gap. This is a subtle, elegant fix -- add more vertical padding and spacing to the Report Summary card header so the table becomes slightly taller, matching the natural height of the two left-column cards.

### Changes

**1. `src/pages/DealerDetail.tsx` -- Remove the forced height clamp**
- Change the left column from `lg:h-0 lg:min-h-full overflow-hidden` back to just `min-h-0` so the cards render at their natural height without clipping.

**2. `src/components/dealer/ReportSummaryCard.tsx` -- Expand the header area**
- Increase header padding from `px-5 py-4` to `px-5 py-5` (adds ~8px total height).
- Bump the title text from `text-sm` to `text-base` for a slightly more prominent header.
- Add a subtle description line beneath the title (e.g. "Section-by-section compliance breakdown") in `text-xs text-muted-foreground` to add another ~20px of natural height.
- Increase table row vertical padding from `py-3` to `py-3.5` across thead and tbody rows, adding ~8px per row across 8+ rows (~64px total).

Combined, these tweaks add roughly 90-100px of natural height to the Report Summary, which should close the gap with the two left-column cards without any forced clipping or overflow hacks.

### Result
Both columns will render at their natural heights. The Report Summary table gains a slightly more spacious, premium feel via its expanded header and row padding, and its total height will match (or very slightly exceed) the left-column stack. No content gets clipped or squared off.

