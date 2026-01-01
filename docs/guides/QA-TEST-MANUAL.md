# Generic Prime - Comprehensive QA Test Manual

## TABLE OF CONTENTS
1. Application Overview
2. Getting Started & Access
3. UI Components & Controls
4. Test Scenarios & Expected Results
5. Known Good Data Values (Baseline)
6. Step-by-Step Test Procedures
7. Troubleshooting

---

## 1. APPLICATION OVERVIEW

### What is Generic Prime?

Generic Prime is a **domain-agnostic data discovery and analysis application** built with Angular 20 and PrimeNG components. It allows users to browse, filter, and analyze structured data with an intuitive interface.

**Current Domain**: Automobile vehicle specifications and data

**Key Capabilities**:
- Browse and filter vehicle data across 4,887 vehicle records
- Apply multiple filters (Manufacturer, Model, Body Class, Year)
- View detailed results in a data table with pagination
- Generate statistics and charts based on filtered data
- Pop-out individual panels into separate windows
- Synchronize filter changes across multiple windows

### Architecture Highlights

1. **URL-First State Management**: The URL is the single source of truth for all filters and state
2. **Configuration-Driven**: Domain-specific settings are in configuration files, not hardcoded
3. **PrimeNG Components**: Uses PrimeNG tables, dropdowns, dialogs, and charts
4. **Domain-Agnostic Framework**: Can be adapted to work with any domain (currently automobile)
5. **BroadcastChannel Inter-Window Communication**: Pop-out windows stay synchronized with the main window

---

## 2. GETTING STARTED & ACCESS

### Prerequisites

Before testing, ensure:
- The development server is running on port 4205
- You have access to http://192.168.0.244:4205 (Thor development server)
- Browser: Chrome/Chromium (Playwright tests use Chromium)
- Network: Can access backend API at http://generic-prime.minilab

### Accessing the Application

**Main URL**: `http://192.168.0.244:4205/automobiles/discover`

**What to expect on first load**:
1. Four main panels visible on the screen
2. Left side: Query Control and Picker panels
3. Right side: Results Table (top) and Statistics (bottom)
4. Results table shows initial list of vehicles
5. No filter chips visible
6. URL should be clean: `/automobiles/discover` (no query parameters)

### Browser DevTools

To monitor the application's behavior:
- Open Chrome DevTools (F12)
- **Console tab**: Watch for any JavaScript errors (there should be none)
- **Network tab**: Monitor API calls to `/api/specs/v1/` endpoints
- **Elements tab**: Inspect DOM and verify `data-testid` attributes are present

---

## 3. UI COMPONENTS & CONTROLS

### Layout Overview

```
┌─────────────────────────────────────────────────────────┐
│  /automobiles/discover (clean URL)                      │
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
│                 │  │ Year Range Distribution (Line)   │ │
│                 │  └──────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────┘
```

### Component Details

#### 1. Query Control Panel
**Purpose**: Apply and manage filters

**Test ID**: `query-control-panel`

**Components**:
- **Filter Field Dropdown**: Selector to choose which filter to add
  - Options: Manufacturer, Model, Body Class, Year
  - Opens a dialog when selected

- **Filter Chips**: Display active filters
  - Shows applied filter values
  - Click to edit
  - Click X to remove individual filter

- **Clear All Button**: Remove all filters at once

**Data Selectors**:
- Query panel container: `data-testid="query-control-panel"`
- Filter dropdown: `.p-select` (PrimeNG 20)

#### 2. Picker Panel
**Purpose**: Quick selection of Manufacturer and Model using dedicated pickers

**Test ID**: `picker-panel`

**Components**:
- **Manufacturer Dropdown**: List of all 72 manufacturers
- **Model Dropdown**: Available models for selected manufacturer

**Data Selectors**:
- Picker panel container: `data-testid="picker-panel"`
- Picker table: `data-testid="picker-table"`

#### 3. Results Table Panel
**Purpose**: Display vehicle records matching applied filters

**Test ID**: `basic-results-table-panel`

**Components**:
- **Data Table**: Shows vehicle details in rows (20 per page)
- **Pagination Info**: Shows "Showing X to Y of TOTAL"
- **Sort Controls**: Column headers allow sorting

**Data Selectors**:
- Results panel: `data-testid="basic-results-table-panel"`
- Results table: `data-testid="basic-results-table"`

#### 4. Statistics Panel
**Purpose**: Show analytics and distributions of filtered data

**Test ID**: `statistics-panel`

**Components**:
- Manufacturer Distribution Chart (Pie/Bar)
- Body Class Distribution (Bar)
- Year Distribution (Line)

---

## 4. TEST SCENARIOS & EXPECTED RESULTS

### Test Scenario 1: Initial Page Load

**Steps**:
1. Navigate to `http://192.168.0.244:4205/automobiles/discover`
2. Wait for page to fully load
3. Observe all four panels

**Expected Results**:
- All 4 panels visible
- Results Table shows all 4,887 records
- URL is clean: `/automobiles/discover`
- Pagination shows: "Showing 1 to 20 of 4,887"
- No console errors

### Test Scenario 2: Apply Single Manufacturer Filter

**Steps**:
1. Navigate to clean page
2. Select "Manufacturer" from filter dropdown
3. Select "Chevrolet" from dialog
4. Observe results

**Expected Results**:
- URL updates to: `?manufacturer=Chevrolet`
- Filter chip "Chevrolet" appears
- Results show only Chevrolet vehicles
- Pagination shows ~849 records

### Test Scenario 3: Apply Multiple Filters

**Steps**:
1. Apply Chevrolet filter
2. Add Model filter: "Camaro"
3. Add Body Class filter: "Coupe"

**Expected Results**:
- URL: `?manufacturer=Chevrolet&model=Camaro&bodyClass=Coupe`
- Three filter chips visible
- Results significantly reduced
- All components reflect filters

### Test Scenario 4: Year Range Filter

**Steps**:
1. Add Year filter
2. Set min=2020, max=2024
3. Apply

**Expected Results**:
- URL: `?yearMin=2020&yearMax=2024`
- Filter chip shows year range
- Results show ~290 records

### Test Scenario 5: Clear All Filters

**Steps**:
1. With multiple filters applied
2. Click "Clear All"

**Expected Results**:
- All chips disappear
- URL reverts to clean
- Results return to 4,887

### Test Scenario 6: URL-First Filter Application

**Steps**:
1. Navigate directly to: `?manufacturer=Ford`

**Expected Results**:
- Filter chip "Ford" appears immediately
- Results show Ford vehicles (~600)
- All panels reflect the filter

### Test Scenario 7: Pop-Out Window Synchronization

**Steps**:
1. Apply Chevrolet filter
2. Pop out Results Table
3. In main window, add Model filter
4. Observe pop-out updates

**Expected Results**:
- Pop-out opens with current data
- When main window filter changes, pop-out updates automatically
- No page reload required in pop-out

---

## 5. KNOWN GOOD DATA VALUES (BASELINE)

### Overall Statistics
| Metric | Value |
|--------|-------|
| Total Vehicle Records | 4,887 |
| Total Manufacturers | 72 |
| Manufacturer-Model Combos | 881 |
| Unique Body Classes | 12 |

### Manufacturer Counts (Sample)
| Manufacturer | Record Count |
|--------------|-------------|
| Chevrolet | ~849 |
| Ford | ~600 |
| RAM | ~500 |

### Model Examples
| Manufacturer | Model | Count |
|--------------|-------|-------|
| Chevrolet | Camaro | ~59 |
| Chevrolet | Corvette | ~47 |
| Ford | Mustang | ~50+ |

### Year Range Examples
| Range | Approximate Count |
|-------|------------------|
| 2020-2024 | ~290 |
| 2015-2019 | ~500+ |

---

## 6. STEP-BY-STEP TEST PROCEDURES

### Procedure A: Basic Smoke Test (5 minutes)

1. Navigate to `/automobiles/discover`
2. Verify all 4 panels visible
3. Check pagination shows 4,887 total records
4. Apply Chevrolet filter
5. Verify results reduced to ~849
6. Click "Clear All"
7. Verify results return to 4,887

**Pass Criteria**: All steps complete without errors

### Procedure B: Filter Combination Testing (15 minutes)

1. Start: `?manufacturer=Ford`
2. Add Model filter: "Mustang"
3. Add Body Class filter: "Coupe"
4. Add Year filter: 2015-2020
5. Verify all four filters active
6. Edit Model chip: change to F-150
7. Remove one filter via X button
8. Clear All
9. Verify back to 4,887 records

**Pass Criteria**: All filter combinations work

### Procedure C: Pop-Out Window Testing (20 minutes)

1. Apply Chevrolet filter
2. Pop out Results Table
3. Verify pop-out shows Chevrolet data
4. Add Model filter in main window
5. Verify pop-out updates without refresh
6. Open Statistics pop-out
7. Verify both pop-outs sync with main window
8. Close pop-outs

**Pass Criteria**: Pop-outs stay synchronized

### Procedure D: Data Consistency Testing (10 minutes)

1. Apply `?manufacturer=Chevrolet`
2. Note Results Table count: ~849
3. Verify Statistics charts reflect Chevrolet only
4. Verify Picker shows Chevrolet selected
5. Verify all components show consistent data

**Pass Criteria**: All components show same filtered data

---

## 7. TROUBLESHOOTING

### Issue: Page won't load

**Solutions**:
- Check dev server: `npm run dev:server`
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+F5

### Issue: Results table shows no data

**Solutions**:
- Check browser console for errors
- Check Network tab for failed API requests
- Clear all filters
- Verify backend is running

### Issue: Pop-out window not synchronizing

**Solutions**:
- Check browser console in pop-out
- Close and reopen pop-out
- Verify running on same origin
- Wait 1-2 seconds for BroadcastChannel

### Issue: Filter chip doesn't update

**Solutions**:
- Hard refresh page
- Check URL format is correct
- Close and reopen browser

---

## Quick Reference

### Common Test URLs

```
# All records
/automobiles/discover

# Chevrolet only
/automobiles/discover?manufacturer=Chevrolet

# Chevrolet Camaros
/automobiles/discover?manufacturer=Chevrolet&model=Camaro

# Year range
/automobiles/discover?yearMin=2020&yearMax=2024

# Complex filter
/automobiles/discover?manufacturer=Ford&yearMin=2015&yearMax=2020&bodyClass=Sedan
```

### Element Selectors

```
[data-testid="query-control-panel"]       # Query Control
[data-testid="picker-panel"]              # Picker
[data-testid="basic-results-table-panel"] # Results Table Panel
[data-testid="basic-results-table"]       # Results Table
[data-testid="statistics-panel"]          # Statistics
.p-select-overlay                         # Dropdown overlay (PrimeNG 20)
.p-dialog                                 # Dialog overlays
```

---

**Test Manual Version**: 1.0
**Created**: 2026-01-01
**Application Version**: 6.0.0
**Technology Stack**: Angular 20, PrimeNG 20, Playwright 1.57
