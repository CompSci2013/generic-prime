# Project Status

**Version**: 5.78
**Timestamp**: 2026-01-01T09:35:00-05:00
**Updated By**: Session 69 - Mimir Models & Cleanup

---

## Session 69 Summary: Mimir Model Documentation & Session Cleanup

**Status**: ✅ **COMPLETED** - Model tooling fixed, documentation updated

### What Was Accomplished

**mimir-models Bash Function Fixed**:
1. ✅ Methodically inspected all 14 Ollama models on Mimir
2. ✅ Fixed SIZE column - now pulls from `/api/tags` correctly
3. ✅ Fixed CONTEXT column - checks `.parameters` for custom `num_ctx` first, falls back to `{family}.context_length`
4. ✅ Handles scientific notation (e.g., `1.024e+06`)
5. ✅ Formats output with K/M suffixes

**RoPE Scaling Documentation**:
1. ✅ Updated `~/ollama-model-variants.md` with RoPE frequency scaling guidance
2. ✅ Documented when `rope_frequency_base` IS needed (LLaMA-2 extending beyond 4K)
3. ✅ Documented when it's NOT needed (Qwen3-Coder has built-in high freq_base of 10M)

**Session Cleanup**:
1. ✅ Removed 15 old screenshots from `frontend/screenshots/captures/`
2. ✅ Removed old pipeline reports from `frontend/reports/`
3. ✅ Preserved valuable artifacts: REQUIREMENTS.md, QA-TEST-MANUAL.md, pipeline scripts

**Bug Investigation (NOT Fixed)**:
- 4 bugs identified during QA testing but NOT fixed this session:
  - BUG #1: Autocomplete serializes as [object Object]
  - BUG #2: Model filter same [object Object] issue
  - BUG #3: Year range filters don't apply from UI
  - BUG #4: Year range fields don't populate from URL

### Current Stack

| Component | Version |
|-----------|---------|
| Angular | 20.3.15 |
| Angular CDK | 20.2.14 |
| PrimeNG | 20.4.0 |
| TypeScript | 5.8.3 |
| Playwright | 1.57.0 |
| Frontend | **6.0.0** |

### Mimir Model Inventory (14 models)

| Model | Params | Quant | Size | Context |
|-------|--------|-------|------|---------|
| qwen3-coder-q8-1Mk | 30B | Q8_0 | 32 GB | 1.0 M |
| qwen3-coder-q8-500k | 30B | Q8_0 | 32 GB | 512 K |
| qwen3-coder-q8-250k | 30B | Q8_0 | 32 GB | 262 K |
| qwen3-coder:30b-a3b-q8_0 | 30B | Q8_0 | 32 GB | 40 K |
| qwen3-vl:235b-a22b-instruct-q4_K_M | 235B | Q4_K_M | 133 GB | 128 K |
| llama4-scout:17b-16e-instruct-ud-q4_K_M | 109B | Q4_K_M | 59 GB | 10 M |

### Branch

- `feature/cline-experiment`

---

## Known Bugs

| Bug | Component | Severity | Status |
|-----|-----------|----------|--------|
| Autocomplete [object Object] | query-panel autocomplete | Medium | Pending |
| Year range UI not applying | query-panel range inputs | Medium | Pending |
| #7 | p-multiSelect (Body Class) | Low | Pending |
| Pop-out re-render | BasicResultsTable | Medium | Deferred |

---

## Priority Order (Updated)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **1** | **Fix Autocomplete/Year Range Bugs** | **HIGH** | **Pending** |
| **2** | **Deploy v6.0.0 to K3s** | **HIGH** | **Pending** |
| **3** | **Merge feature/angular-15-upgrade to main** | **HIGH** | **Ready** |
| 4 | Test Visual Pipeline on Mimir | Medium | Pending |
| 5 | Fix Bug #7 (multiselect visual state) | Low | Pending |

---

**Last Updated**: 2026-01-01T09:35:00-05:00 (Session 69 - Mimir Models & Cleanup)
