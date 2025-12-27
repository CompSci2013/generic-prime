# UI Kit Migration Guide

## Replacing PrimeNG Table with Angular Material Table

This guide demonstrates how the `UiKitModule` facade pattern simplifies UI library migrations. We'll walk through replacing PrimeNG's `p-table` with Angular Material's `mat-table`.

---

## Why the Facade Pattern Helps

### Before UiKitModule (The Old Way)

```
┌─────────────────────────────────────────────────────────────┐
│  App Layer                                                  │
│  ├── PrimengModule (imports TableModule)                    │
│  └── DiscoverComponent (uses <p-table>)                     │
├─────────────────────────────────────────────────────────────┤
│  Framework Layer                                            │
│  ├── imports PrimengModule from '../app/primeng.module'  ❌ │
│  ├── ResultsTableComponent (uses <p-table>)                 │
│  └── BasicResultsTableComponent (uses <p-table>)            │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                               │
│  └── automobile.domain-config.ts (tableConfig for p-table)  │
└─────────────────────────────────────────────────────────────┘

Migration requires:
1. Find all files importing from 'primeng/table'
2. Find all files importing PrimengModule
3. Update every component template using <p-table>
4. Update every domain config's tableConfig
5. Hope you didn't miss anything
```

### After UiKitModule (The New Way)

```
┌─────────────────────────────────────────────────────────────┐
│  App Layer                                                  │
│  └── imports UiKitModule (single import point)              │
├─────────────────────────────────────────────────────────────┤
│  Framework Layer                                            │
│  ├── UiKitModule ← SINGLE POINT OF CONTROL ✅               │
│  │   └── exports TableModule (or MatTableModule)            │
│  ├── ResultsTableComponent                                  │
│  └── BasicResultsTableComponent                             │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                               │
│  └── automobile.domain-config.ts                            │
└─────────────────────────────────────────────────────────────┘

Migration requires:
1. Update UiKitModule imports/exports
2. Create wrapper component (optional)
3. Update framework components
4. Domain configs remain unchanged (if wrapper abstracts differences)
```

---

## Step-by-Step Migration

### Step 1: Install Angular Material

```bash
cd frontend
ng add @angular/material
```

### Step 2: Update UiKitModule

**File**: `frontend/src/framework/ui-kit/ui-kit.module.ts`

```typescript
import { NgModule } from '@angular/core';

// PrimeNG Modules (keeping non-table components)
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
// ... other PrimeNG imports

// Angular Material - NEW
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// REMOVED: import { TableModule } from 'primeng/table';

const UI_MODULES = [
  // PrimeNG (non-table)
  ButtonModule,
  DialogModule,
  // ...

  // Angular Material (table replacement)
  MatTableModule,      // Replaces TableModule
  MatPaginatorModule,  // Replaces p-table pagination
  MatSortModule        // Replaces p-table sorting
];

@NgModule({
  imports: [...UI_MODULES],
  exports: [...UI_MODULES]
})
export class UiKitModule {}
```

**Key Point**: Only this one file changes for the module swap. All consumers still import `UiKitModule`.

### Step 3: Create a Wrapper Component (Recommended)

To minimize template changes across the codebase, create an abstraction layer.

**File**: `frontend/src/framework/components/data-table/data-table.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableConfig, ColumnDefinition } from '../../models';

/**
 * Abstract Data Table Component
 *
 * Wraps the underlying table implementation (Material, PrimeNG, AG Grid, etc.)
 * Provides a consistent API regardless of the UI library used.
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html'
})
export class DataTableComponent<T> {
  @Input() data: T[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: TableConfig<T>;
  @Input() loading = false;
  @Input() totalRecords = 0;

  @Output() rowSelect = new EventEmitter<T>();
  @Output() sort = new EventEmitter<{ field: string; order: 'asc' | 'desc' }>();
  @Output() paginate = new EventEmitter<{ page: number; size: number }>();
}
```

**File**: `frontend/src/framework/components/data-table/data-table.component.html`

```html
<!-- Angular Material Implementation -->
<div class="table-container">
  <table mat-table [dataSource]="data" matSort (matSortChange)="onSort($event)">

    <!-- Dynamic Columns -->
    <ng-container *ngFor="let col of columns" [matColumnDef]="col.field">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>
        {{ col.header }}
      </th>
      <td mat-cell *matCellDef="let row">
        {{ row[col.field] }}
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns"
        (click)="rowSelect.emit(row)">
    </tr>
  </table>

  <mat-paginator
    [length]="totalRecords"
    [pageSize]="config?.pagination?.defaultPageSize || 25"
    [pageSizeOptions]="[10, 25, 50, 100]"
    (page)="onPaginate($event)">
  </mat-paginator>
</div>
```

### Step 4: Update Framework Components

Replace direct `<p-table>` usage with the new wrapper.

**Before** (ResultsTableComponent):
```html
<p-table [value]="data" [columns]="columns" [paginator]="true" [rows]="25">
  <ng-template pTemplate="header">...</ng-template>
  <ng-template pTemplate="body" let-row>...</ng-template>
</p-table>
```

**After**:
```html
<app-data-table
  [data]="data"
  [columns]="columns"
  [config]="tableConfig"
  [totalRecords]="totalRecords"
  (rowSelect)="onRowSelect($event)"
  (sort)="onSort($event)"
  (paginate)="onPaginate($event)">
</app-data-table>
```

### Step 5: Domain Configs Remain Unchanged

Because `TableConfig` is an abstract interface, domain configurations don't need to change:

```typescript
// automobile.domain-config.ts - NO CHANGES REQUIRED
export const AUTOMOBILE_TABLE_CONFIG: TableConfig<VehicleResult> = {
  columns: [
    { field: 'manufacturer', header: 'Manufacturer', sortable: true },
    { field: 'model', header: 'Model', sortable: true },
    { field: 'year', header: 'Year', sortable: true, type: 'number' }
  ],
  pagination: {
    enabled: true,
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100]
  }
};
```

---

## Migration Checklist

| Step | File(s) | Action |
|------|---------|--------|
| 1 | `package.json` | Add `@angular/material` dependency |
| 2 | `ui-kit.module.ts` | Replace `TableModule` with `MatTableModule` |
| 3 | `data-table.component.*` | Create wrapper component (optional but recommended) |
| 4 | `results-table.component.html` | Update template to use wrapper or Material directly |
| 5 | `basic-results-table.component.html` | Update template |
| 6 | Domain configs | No changes if using wrapper abstraction |

---

## Benefits Realized

1. **Single Import Point**: Only `UiKitModule` needed updating for module changes
2. **Gradual Migration**: Can swap one component type at a time (tables first, then dialogs, etc.)
3. **Rollback Safety**: If Material tables don't work out, revert `UiKitModule` changes
4. **No Scattered Imports**: No hunting for `import { TableModule } from 'primeng/table'` across 50 files
5. **Domain Isolation**: Domain configurations remain stable through UI library changes

---

## Hybrid Approach: Gradual Page-by-Page Migration

The facade pattern enables running **both libraries simultaneously** during migration. Different pages/components can use different table implementations:

```typescript
// ui-kit.module.ts - Hybrid period
const UI_MODULES = [
  // PrimeNG (legacy - being phased out)
  TableModule,        // Still used by: ResultsTableComponent, BasicResultsTableComponent

  // Angular Material (new - being adopted)
  MatTableModule,     // Used by: NewReportComponent, AdminDashboard
];
```

### Example: Mixed Codebase

```
┌─────────────────────────────────────────────────────────────┐
│  Discover Page (/automobiles/discover)                      │
│  └── ResultsTableComponent                                  │
│      └── Uses <p-table> (PrimeNG) ← LEGACY, migrate later   │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard (/admin)                                   │
│  └── AdminTableComponent                                    │
│      └── Uses <mat-table> (Material) ← NEW implementation   │
├─────────────────────────────────────────────────────────────┤
│  Reports Page (/reports)                                    │
│  └── ReportTableComponent                                   │
│      └── Uses <mat-table> (Material) ← NEW implementation   │
└─────────────────────────────────────────────────────────────┘
```

### Migration Timeline Example

| Sprint | Action | Pages Affected |
|--------|--------|----------------|
| 1 | Add MatTableModule to UiKitModule | None (preparation) |
| 2 | Migrate Admin Dashboard to Material | `/admin` |
| 3 | Migrate Reports page to Material | `/reports` |
| 4 | Migrate Discover page to Material | `/automobiles/discover` |
| 5 | Remove TableModule from UiKitModule | All pages now Material |

### Why This Works

1. **Both modules exported**: `UiKitModule` exports both `TableModule` and `MatTableModule`
2. **Templates choose**: Each component template uses whichever table tag it needs (`<p-table>` or `<mat-table>`)
3. **No runtime conflict**: PrimeNG and Material tables have different selectors, so they coexist peacefully
4. **Test in production**: New Material pages can be tested with real users while legacy pages remain stable
5. **Rollback per-page**: If Material table has issues on Admin page, revert just that component—other pages unaffected

### Code Example: Coexisting Tables

**ResultsTableComponent** (legacy, still using PrimeNG):
```html
<!-- Uses PrimeNG - will migrate in Sprint 4 -->
<p-table [value]="data" [paginator]="true" [rows]="25">
  <ng-template pTemplate="body" let-row>
    <tr><td>{{ row.manufacturer }}</td></tr>
  </ng-template>
</p-table>
```

**AdminTableComponent** (new, using Material):
```html
<!-- Uses Angular Material - migrated in Sprint 2 -->
<table mat-table [dataSource]="data">
  <ng-container matColumnDef="manufacturer">
    <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
    <td mat-cell *matCellDef="let row">{{ row.manufacturer }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>
<mat-paginator [pageSize]="25"></mat-paginator>
```

**Both work simultaneously** because `UiKitModule` exports both `TableModule` and `MatTableModule`.
