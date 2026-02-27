

## Fix: Eliminate Whitespace in Customer Sentiment Section

### Problem
The Customer Sentiment card sits in a 1-column slot alongside the 2-column Report Summary table (which has 8+ rows and is much taller). Since the Report Summary is non-negotiable, the CSS card finishes early and leaves a large blank gap below it.

### Solution
Stack a second compact card below the Customer Sentiment card in the same grid column to fill the vertical space. The best candidate is the **Action Status Chart** (donut chart showing Pending/In Progress/Complete actions) -- it is compact, visually distinct from the ring gauge, and contextually relevant at the top of the profile.

### Changes

**1. `src/pages/DealerDetail.tsx` -- Restructure the grid layout**
- Keep the existing `lg:grid-cols-3` grid for the top cards row.
- Wrap the left column (col 1) in a `flex flex-col gap-6` container.
- Place `CustomerSentimentCard` first, then `ActionStatusChart` below it in the same column.
- Remove the `ActionStatusChart` from the separate "Data Visualizations Row" grid further down the page (which currently has 3 charts in a row).
- Adjust the Data Visualizations Row to `lg:grid-cols-2` with just the Radar and Controls Breakdown charts remaining.

**2. `src/components/dealer/CustomerSentimentCard.tsx` -- Minor spacing tightening**
- No major redesign needed -- just ensure it doesn't force extra padding. Remove any `mt-auto` on the breakdown section so it sits tightly.

### Result
The left column will contain two stacked cards (Sentiment + Action Status donut) that together match the height of the Report Summary table on the right. No blank gaps. The Data Visualizations row below adjusts to two charts instead of three, maintaining a clean layout.

