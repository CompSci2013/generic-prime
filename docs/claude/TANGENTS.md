# Tangents & Follow-up Topics

This document tracks discussion topics and questions that come up during sessions but aren't the current task. These are candidates for future work or clarification.

---

## Active Tangents

### 1. Authentication & User Credentials for Desktop-Only App
**Date Raised**: 2025-12-14
**Status**: Pending discussion
**Summary**:
- App is meant for desktop only
- Each user logs in and receives domain-specific credentials (certificates)
- Credentials must be saved to browser
- Question: How to implement this in "Halo Labs" environment?
- Also mentioned: Past discussion about dummy user authentication service, unclear how far implementation went

**Investigation Completed**: ✅
- Found comprehensive auth specifications (3,800+ lines) but ZERO implementation
- App is currently 100% public with no login required
- No references to "Halo Labs" in codebase
- Recommendations provided for mock vs full implementation

**Next Steps**:
- User to decide: Mock auth (quick, for dev) or Full auth (production-ready)
- Implement chosen approach
- Integrate credential/certificate storage for domains

**Related Files**:
- `/docs/specs/auth/authentication-service.md` (2,264 lines - ready for implementation)
- `/docs/specs/11-navigation-authorization.md` (1,578 lines - ready for implementation)
- `/frontend/src/framework/services/http-error.interceptor.ts` (partial infrastructure)

### 2. Smart Domain Navigation Dropdown Menu in Banner
**Date Raised**: 2025-12-14
**Status**: Implementation Complete - Proper TieredMenu with Flyout Submenus
**Summary**:
- User requested a smart dropdown menu in the app header/banner
- Should allow quick navigation between domains from any page
- No need to click "Home" then select another domain
- Should include flyout menus for sub-pages within domains (e.g., /automobiles, /automobiles/discover)

**Investigation Completed**: ✅
- Current app structure explored
- All routes documented: 5 domains with landing pages + discover routes + report page
- Researched PrimeNG menu components: found TieredMenu is designed for flyout submenus
- Banner location identified: `<header class="app-header">` in app.component.html

**Implementation Completed**: ✅ (Version 2 - Proper Implementation)
- Replaced initial dropdown implementation with **PrimeNG TieredMenu component**
- TieredMenu natively supports nested items with flyout overlay behavior
- Menu uses proper hierarchical structure with `items` array for submenus
- Navigation via `routerLink` property on MenuItem objects
- Dark theme styling with cyan accents on submenus
- Automatic flyout positioning and hover behavior

**Implementation Details**:
- **Component**: `p-tieredMenu` with `[model]="domainMenuItems"`
- **Structure**: Nested MenuItem array from `primeng/api`
  ```typescript
  {
    label: 'Automobiles',
    icon: '🚗',
    items: [
      { label: 'Autos Home', icon: '🏠', routerLink: '/automobiles' },
      { label: 'Autos Discover', icon: '🔍', routerLink: '/automobiles/discover' }
    ]
  }
  ```
- **Styling**:
  - Root menu items display horizontally in header
  - Submenu flyouts positioned as overlays with cyan border
  - Dark background (#3c3c3c) with hover highlights
  - Box shadow for depth: `0 4px 12px rgba(0, 0, 0, 0.5)`
- **Navigation**: routerLink directly on MenuItem - no custom handlers needed

**Flyout Menu Display**:
```
Header: [🏠 Home] [🚗 Automobiles] [🌾 Agriculture] [⚛️ Physics] [🧪 Chemistry] [📐 Mathematics] [📋 Test Reports]

Hovering on "Automobiles" shows flyout:
┌─────────────────────┐
│ 🏠 Autos Home       │
│ 🔍 Autos Discover   │
└─────────────────────┘
```

**Research Sources**:
- [PrimeNG Menu Component](https://primeng.org/menu)
- [PrimeNG TieredMenu Component](https://primeng.org/tieredmenu)
- [PrimeNG TieredMenu Methods](https://www.geeksforgeeks.org/angular-primeng-tieredmenu-methods/)
- [Angular UI Development with PrimeNG - TieredMenu Book Reference](https://www.oreilly.com/library/view/angular-ui-development/9781788299572/c8e8caeb-b956-4a44-a399-64bb6b0e1dcb.xhtml)

**Related Files**:
- `/frontend/src/app/app.component.ts` (MenuItem[] structure with nested items)
- `/frontend/src/app/app.component.html` (p-tieredMenu component)
- `/frontend/src/app/app.component.scss` (TieredMenu styling for root list and submenus)
- `/frontend/src/app/primeng.module.ts` (TieredMenuModule imported)

**Next Steps**:
- Build and test the TieredMenu in running app
- Verify flyout behavior on hover from all pages
- Verify navigation to all routes works correctly
- Confirm visual styling and dark theme consistency

---

## Historical Tangents (Resolved)

None yet - this is the first document.

---

## How to Use This Document

1. **When a tangent comes up**: I'll add it here with a description, date, and status
2. **After current task completion**: I'll remind you of pending tangents for prioritization
3. **When clarification needed**: I'll reference the relevant tangent to provide context
4. **Periodically**: This doc gets updated to show progress/status

---

## Template for New Tangents

```markdown
### N. [Short Title]
**Date Raised**: YYYY-MM-DD
**Status**: Pending / In Discussion / Investigating / Ready for Implementation
**Summary**: [2-3 sentence description of the issue/question]
**Related Files**: [List relevant files/docs]
**Next Steps**: [What would need to happen next]
```
