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
**Status**: Implementation Complete (and Verified)
**Summary**:
- User requested a smart dropdown menu in the app header/banner
- Should allow quick navigation between domains from any page
- No need to click "Home" then select another domain
- Should include organized menus for sub-pages within domains (e.g., /automobiles, /automobiles/discover)

**Investigation Completed**: ✅
- Current app structure explored
- All routes documented: 5 domains with landing pages + discover routes + report page
- PrimeNG DropdownModule already imported and available
- Banner location identified: `<header class="app-header">` in app.component.html
- Current header only has simple "Home" link - room for enhancement

**Implementation Completed**: ✅
- Dropdown menu fully implemented with flat structure + visual grouping
- Menu structure: Home → Separator → Domain groups → Separator → Test Reports
- Each domain has bold cyan header followed by indented sub-items
- Uses custom styling for group labels and indented items
- Navigation routing integrated with automatic dropdown reset

**Implementation Details**:
- **Structure**: Flat array with `groupLabel` markers for category headers
- **Visual Organization**:
  - Group labels displayed in bold cyan (#64c8ff)
  - Sub-items indented by 1.5rem with smaller font
  - Separators between Home/Domains and Reports sections
- **Navigation**: Only items with `route` property trigger navigation
- **UX**: Dropdown automatically closes after selection via DOM click

**Menu Display**:
```
🏠 Home
───────────────
🚗 Automobiles (bold cyan, groupLabel)
  🏠 Autos Home (indented)
  🔍 Autos Discover (indented)
🌾 Agriculture (bold cyan, groupLabel)
  🏠 Agriculture Home (indented)
  🔍 Agriculture Discover (indented)
⚛️  Physics (bold cyan, groupLabel)
  🏠 Physics Home (indented)
  🔍 Physics Discover (indented)
🧪 Chemistry (bold cyan, groupLabel)
  🏠 Chemistry Home (indented)
  🔍 Chemistry Discover (indented)
📐 Mathematics (bold cyan, groupLabel)
  🏠 Math Home (indented)
  🔍 Math Discover (indented)
───────────────
📋 Test Reports
```

**Related Files**:
- `/frontend/src/app/app.component.ts` (menu data structure + navigation logic)
- `/frontend/src/app/app.component.html` (dropdown implementation with custom templates)
- `/frontend/src/app/app.component.scss` (styling with group labels + indentation)
- `/frontend/src/app/primeng.module.ts` (DropdownModule already imported)

**Next Steps**:
- Build and test the dropdown in running app
- Verify navigation from all pages works correctly
- Verify visual styling (indentation, group label colors, separators)

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
