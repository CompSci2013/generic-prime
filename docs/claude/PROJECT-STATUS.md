# Project Status

**Version**: 2.4
**Timestamp**: 2025-11-30T21:15:00Z
**Updated By**: Chart Layout Refinement Session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Statistics panel charts refined** - Golden ratio aspect ratio (1.618:1) applied
- **Chart layout fixed** - Removed hardcoded heights, using CSS aspect-ratio property
- **All 4 panels active** with drag-drop, collapse, and pop-out functionality
- **Charts display in 2x2 grid** with proper proportioning and visible axis labels
- Backend at `generic-prime-backend-api:v1.5.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-30)

### Statistics Panel Chart Layout Refinement

Fixed chart sizing and aspect ratio issues in the Statistics panel:

| Issue | Solution |
|-------|----------|
| Charts too tall, displaying as 1:1 squares | Applied golden ratio (1.618:1) CSS aspect-ratio |
| Plotly hardcoded `height: 400` overriding container sizing | Removed height property, let container control sizing |
| Axis label clipping | Maintained `automargin: true` on Plotly axes |
| Chart containers expanding horizontally | Added CSS `aspect-ratio: 1.618 / 1` for fixed proportions |

### Files Modified

| File | Change |
|------|--------|
| `statistics-panel.component.scss` | Changed `.chart-container` aspect-ratio from 1:1 to 1.618:1 (golden ratio) |
| `statistics-panel.component.html` | Removed inline `[style.height.px]` binding |
| `body-class-chart-source.ts` | Removed explicit `height: 400` from Plotly layout |
| `manufacturer-chart-source.ts` | Removed explicit `height: 400` from Plotly layout |
| `year-chart-source.ts` | Removed explicit `height: 400` from Plotly layout |
| `top-models-chart-source.ts` | Removed explicit `height: 400` from Plotly layout |

### Technical Approach

**Problem**: Plotly's `scaleanchor` and `scaleratio` properties constrain the *plot area* scaling relationship but don't constrain the *container* to be square.

**Solution**: Used CSS `aspect-ratio` property to constrain the chart container itself:
```css
.chart-container {
  aspect-ratio: 1.618 / 1;  /* Golden ratio: wider than tall */
}
```

**Result**:
- Charts maintain golden ratio (1.618:1) aspect ratio across all zoom levels
- 2×2 grid layout with proper spacing
- All axis labels visible without overflow
- Responsive to container width changes

### Plotly Configuration Maintained

All four chart sources retain proper Plotly settings:
- `automargin: true` on axes - prevents label clipping
- `scaleanchor` and `scaleratio` - maintains plot area proportions
- Proper margins for rotated axis labels
- Stacked bar styling for highlighted vs. other data

---

## Governing Tactic

**Chart layout complete. Next priority: Validate domain architecture.**

The statistics panel now displays correctly with proper proportioning. The draggable panel layout is fully restored with all 4 panels active.

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Working in picker |
| Unique Body Classes | 12 | Via /agg/body_class |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.5.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #13 | Medium | Not started | Dropdown keyboard navigation (arrow keys, Enter/Space) broken |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Add a new "agriculture" domain** - Create a new domain configuration to prove the new architecture
2. **Fix Bug #13** - Dropdown keyboard navigation (may be PrimeNG issue)
3. **Fix Bug #7** - Checkbox visual state

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
