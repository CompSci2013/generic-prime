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
