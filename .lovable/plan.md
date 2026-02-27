

## Fix: Left Column Overflowing Report Summary Height

### Problem
The Customer Sentiment card + Action Status Chart stacked together now exceed the height of the Report Summary table on the right. The left column is taller than its sibling.

### Solution
Compact both left-column cards and make the Action Status Chart adapt to fill only the remaining space rather than having a fixed-height chart.

### Changes

**1. `src/components/dealer/CustomerSentimentCard.tsx` -- Tighten spacing**
- Reduce the ScoreRing size from 120px to 100px
- Reduce padding from `p-5` to `p-4`
- Reduce margin-bottom on header from `mb-4` to `mb-3`
- Reduce spacing between main score area and breakdown from `mb-4` to `mb-3`
- Reduce category row spacing from `space-y-2` to `space-y-1.5`
- Reduce MiniRing size from 28px to 24px
- Remove the RAG legend (0-3.3 / 3.4-6.6 / 6.7-10) as it's redundant -- the color coding is self-explanatory

**2. `src/components/dealer/ActionStatusChart.tsx` -- Make compact and fill remaining space**
- Add `flex-1` to the root container so it stretches to fill remaining column space
- Reduce the chart height from 140px to 120px
- Reduce the donut inner/outer radius slightly (32/54)
- Reduce padding from `p-5` to `p-4`
- Combine the status legend and priority summary into a tighter layout
- Reduce gap between chart and legend from `gap-4` to `gap-3`

**3. `src/pages/DealerDetail.tsx` -- Minor layout tweak**
- Ensure the left column flex container uses `min-h-0` to prevent overflow and the ActionStatusChart card uses `flex-1` to fill remaining space naturally

### Result
Both cards will be compact enough to fit within the height of the Report Summary table. The Action Status Chart will flex to fill exactly the remaining space after the Sentiment card, keeping both columns aligned.
