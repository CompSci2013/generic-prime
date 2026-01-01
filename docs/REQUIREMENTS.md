# REQUIREMENTS DOCUMENT: GENERIC-PRIME DISCOVERY FRAMEWORK

**Document Version**: 1.0
**Last Updated**: 2026-01-01
**Application Version**: 6.0.0

---

## TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [User Stories](#2-user-stories)
3. [Functional Requirements](#3-functional-requirements)
4. [Data Requirements](#4-data-requirements)
5. [UI/UX Requirements](#5-uiux-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Known Constraints & Limitations](#7-known-constraints--limitations)

---

## 1. PRODUCT VISION

### What is this application for?

Generic-Prime is a **domain-agnostic data discovery and analysis framework** built with Angular 20, designed to enable browsing, filtering, and analyzing large datasets with powerful visualization and filtering capabilities. The framework is currently configured for **automobile vehicle data** (4,887 unique vehicle specs) but is architected to work with any domain (agriculture, real estate, scientific data, etc.).

### Who uses it?

- **Data Analysts**: Browse and analyze large vehicle datasets with advanced filtering
- **Business Researchers**: Generate statistics and insights about market segments
- **Multi-domain Organizations**: Can rapidly deploy the framework to new domains without code changes

### Core Values

1. **Configuration-driven** (not code-driven)
2. **URL as single source of truth**
3. **Framework-agnostic** (works with any domain via adapters)
4. **Pop-out windows** for multi-monitor workflows
5. **Performance-optimized** with Angular Signals and OnPush change detection

---

## 2. USER STORIES

### US-001: Basic Vehicle Discovery
**As a** data analyst,
**I want to** search for vehicles by manufacturer, model, and year,
**so that** I can discover specific vehicle types in the database.

**Acceptance Criteria**:
- [ ] Filter by manufacturer (autocomplete search)
- [ ] Filter by model (autocomplete search)
- [ ] Filter by year range (min/max inputs)
- [ ] Filter by body class (multi-select dropdown)
- [ ] Filters persist in URL query parameters
- [ ] Results update in real-time as filters change

---

### US-002: View Vehicle Results in Table
**As a** data analyst,
**I want to** see search results in a sortable, paginated table,
**so that** I can browse vehicle specifications efficiently.

**Acceptance Criteria**:
- [ ] Results table displays: Manufacturer, Model, Year, Body Class, VIN Count
- [ ] Table supports sorting by any column
- [ ] Pagination with configurable page size (default 20)
- [ ] Skeleton loaders shown while data loads

---

### US-003: View Statistics and Charts
**As a** business researcher,
**I want to** see aggregated statistics and visualizations,
**so that** I can analyze market trends and distributions.

**Acceptance Criteria**:
- [ ] Statistics panel displays: Total vehicles, Year range
- [ ] Charts render: Manufacturer distribution, Body class distribution
- [ ] Charts are interactive (hover shows values)
- [ ] Charts update when filters change

---

### US-004: Select Manufacturer-Model Combinations
**As a** filter builder,
**I want to** use a picker panel to select multiple manufacturer-model combinations,
**so that** I can create complex multi-model filters.

**Acceptance Criteria**:
- [ ] Picker table shows: Manufacturer, Model, Count
- [ ] Search across manufacturer and model fields
- [ ] Checkbox multi-select (select/deselect individual rows)
- [ ] Selected items applied as filter to results
- [ ] Selection persisted in URL parameters

---

### US-005: Pop-Out Panels to Separate Windows
**As a** power user with multiple monitors,
**I want to** move panels to separate browser windows,
**so that** I can view multiple data aspects simultaneously.

**Acceptance Criteria**:
- [ ] Click "pop-out" button to open panel in new window
- [ ] Pop-out windows show: Picker, Query Control, Statistics, or Results Table
- [ ] Pop-out windows receive state updates from main window in real-time
- [ ] Closing pop-out window removes it from tracking
- [ ] Main window shows placeholder when panel is popped out

---

### US-006: Clear All Filters
**As a** user,
**I want to** reset filters with one click,
**so that** I can start a new search quickly.

**Acceptance Criteria**:
- [ ] "Clear All Filters" button resets all filter parameters
- [ ] Resets pagination to page 1
- [ ] URL query parameters cleared
- [ ] Table refreshed with all data (4,887 records)

---

### US-007: URL State Persistence
**As a** user,
**I want to** share my current view via URL,
**so that** others can see exactly what I'm seeing.

**Acceptance Criteria**:
- [ ] All filters encoded in URL query parameters
- [ ] Navigating to URL with parameters applies those filters
- [ ] Browser back/forward maintains filter state
- [ ] Bookmarking URL preserves complete application state

---

## 3. FUNCTIONAL REQUIREMENTS

### FR-001: Filter Functionality

| Filter Type | Fields | Behavior |
|-------------|--------|----------|
| Text/Autocomplete | Manufacturer, Model | Partial matching, debounced 500ms |
| Range | Year (min/max) | Dual input fields, validation: min ≤ max |
| Multi-select | Body Class | Options loaded from API, case-insensitive |

**URL Parameters**:
```
manufacturer=Chevrolet
model=Camaro
yearMin=2020
yearMax=2024
bodyClass=Sedan,Coupe
```

---

### FR-002: Results Table Behavior

- **Columns**: Manufacturer, Model, Year, Body Class, Count
- **Sorting**: All columns sortable, default by manufacturer (asc)
- **Pagination**:
  - Default page size: 20
  - Options: 10, 20, 50, 100
  - Total count displayed

---

### FR-003: Statistics & Charts

**Summary Stats**:
- Total unique vehicles
- Number of unique manufacturers (72)
- Number of unique models
- Year range (min/max)

**Chart Types**:
- Manufacturer Distribution (bar chart, top 20)
- Body Class Distribution (pie chart)
- Year Distribution (line chart)

---

### FR-004: Picker Panel Behavior

- **Display**: Table with Manufacturer, Model, Count columns
- **Search**: Filter rows by typing in Manufacturer or Model
- **Pagination**: 20 rows per page
- **Selection**: Checkbox multi-select
- **Output**: Selected items applied as filter

---

### FR-005: Pop-Out Windows

**Communication**:
- BroadcastChannel for cross-window messaging
- Main → Pop-out: STATE_UPDATE on URL change
- Pop-out receives state and updates display

**Window Management**:
- Multiple pop-outs can be open simultaneously
- Closing detected via polling (500ms)
- Closing main window closes all pop-outs

---

### FR-006: URL State Management

**URL Format**: `/automobiles/discover?param1=value1&param2=value2`

**Sync Mechanism**:
- URL is single source of truth
- URL changes → UrlStateService detects → filters update
- Filter changes → URL updates via router

---

## 4. DATA REQUIREMENTS

### Data Dictionary

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| manufacturer | string | Vehicle brand name | Toyota, Honda, Ford |
| model | string | Vehicle model name | Camry, Accord, F-150 |
| year | number | Model year | 2024, 2020, 1995 |
| body_class | string | Vehicle body type | Sedan, SUV, Truck, Coupe |

### Baseline Data Values

| Metric | Value |
|--------|-------|
| Total Vehicle Records | 4,887 |
| Total Manufacturers | 72 |
| Manufacturer-Model Combos | 881 |
| Unique Body Classes | 12 |

### Sample Counts

| Manufacturer | Count |
|--------------|-------|
| Chevrolet | ~849 |
| Ford | ~600 |
| RAM | ~500 |

| Model | Manufacturer | Count |
|-------|--------------|-------|
| Camaro | Chevrolet | ~59 |
| Corvette | Chevrolet | ~47 |
| Mustang | Ford | ~50 |

### Body Classes

Sedan, SUV, Truck, Coupe, Convertible, Wagon, Van, Hatchback, Minivan, Pickup, Hybrid, Electric (12 total)

---

## 5. UI/UX REQUIREMENTS

### Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Automobile Discovery                     │
├─────────────────┬───────────────────────────────────────┤
│   QUERY PANEL   │     RESULTS TABLE PANEL                │
│ - Filter Field  │  ┌──────────────────────────────────┐ │
│   Dropdown      │  │ Make | Model | Year | Body Class │ │
│ - Filter Chips  │  ├──────────────────────────────────┤ │
│ - Clear All Btn │  │ Chevrolet | Impala | 2023 | Sedan │ │
├─────────────────┤  │ Chevrolet | Camaro | 2022 | Coupe │ │
│  PICKER PANEL   │  │ ... (20 rows per page) ...        │ │
│ - Manufacturer  │  │ [Pagination: Page 1 of 244]       │ │
│   Dropdown      │  └──────────────────────────────────┘ │
│ - Model         │                                       │
│   Dropdown      ├───────────────────────────────────────┤
│                 │     STATISTICS PANEL                  │
│                 │  ┌──────────────────────────────────┐ │
│                 │  │ Manufacturer Distribution (Pie)  │ │
│                 │  │ Body Class Distribution (Bar)    │ │
│                 │  └──────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────┘
```

### Component Test IDs

| Component | Test ID |
|-----------|---------|
| Query Control Panel | `query-control-panel` |
| Picker Panel | `picker-panel` |
| Results Table Panel | `basic-results-table-panel` |
| Results Table | `basic-results-table` |
| Statistics Panel | `statistics-panel` |

### PrimeNG 20 Selectors

| Element | Selector |
|---------|----------|
| Select Overlay | `.p-select-overlay` |
| Select Options | `.p-select-list .p-select-option` |
| Dialog | `.p-dialog` |
| Table Rows | `p-table tbody tr` |

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| Filter Response | < 300ms |
| Chart Rendering | < 1 second |
| Page Navigation | < 500ms |

### Browser Support

- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest version
- Minimum Resolution: 1024x768

### Technology Stack

| Component | Version |
|-----------|---------|
| Angular | 20.3.15 |
| PrimeNG | 20.4.0 |
| TypeScript | 5.8.3 |
| Playwright | 1.57.0 |

---

## 7. KNOWN CONSTRAINTS & LIMITATIONS

### Intentional Design Decisions (NOT Bugs)

| Behavior | Reason |
|----------|--------|
| **Manufacturer appears multiple times in Picker** | Each row is a unique manufacturer-model combination. Chevrolet with Camaro, Chevrolet with Corvette, etc. are separate rows. |
| **Pop-out windows don't make API calls** | Main window is source of truth; pop-outs receive data via BroadcastChannel to avoid redundant requests |
| **URL is always updated on filter change** | URL-first architecture enables sharing, bookmarking, and browser history |
| **No row selection in Results Table** | Read-only discovery interface; use Picker for multi-select |
| **No real-time updates** | Backend is request-response only; user must refresh for new data |
| **No export to Excel/CSV** | Out of scope for Phase 1 |

### Technical Constraints

1. **Never call `router.navigate()` directly** - use `UrlStateService`
2. **OnPush change detection** - requires `detectChanges()` for pop-out windows
3. **Pop-out close detection** - polling every 500ms (no reliable JS event)
4. **BroadcastChannel** - same-origin only

---

## APPENDIX: API Reference

### Endpoints

```
GET /api/specs/v1/vehicles/details
    ?manufacturer=Chevrolet
    &model=Camaro
    &yearMin=2020
    &yearMax=2024
    &bodyClass=Coupe
    &page=1
    &size=20
    &sort=manufacturer
    &sortDirection=asc
```

### Response Format

```json
{
  "data": [
    {
      "manufacturer": "Chevrolet",
      "model": "Camaro",
      "year": 2024,
      "body_class": "Coupe"
    }
  ],
  "total": 59,
  "page": 1,
  "size": 20
}
```

---

**End of Requirements Document**
