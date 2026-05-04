# Performance budgets — Tuitional LMS Mobile

> Live document. Update when a screen ships or a budget is intentionally renegotiated. Do **not** loosen a budget to make a failing test pass — fix the regression.

**Canonical target device:** Pixel 4a (Android 13), production JS bundle.
**iOS guarantee:** if the budget passes on Pixel 4a, it passes on iPhone 12+.

---

## Per-screen budgets

| Screen | TTI (ms) | Scroll FPS | JS heap (MB) | Status |
|---|---:|---:|---:|---|
| `users` list | ≤ 600 | ≥ 58 | ≤ 80 | active |
| `users/[id]` detail | ≤ 400 | n/a | ≤ 60 | active |
| `users/add` form | ≤ 350 | n/a | ≤ 55 | active |
| `users/edit` form | ≤ 400 | n/a | ≤ 60 | active |
| `enrollments` list | ≤ 700 | ≥ 58 | ≤ 90 | planned |
| `schedule` list | ≤ 700 | ≥ 58 | ≤ 90 | planned |
| `chat` thread list | ≤ 600 | ≥ 58 | ≤ 80 | planned |
| `chat` message view | ≤ 500 | ≥ 58 | ≤ 100 | planned |
| `billing` summary | ≤ 600 | n/a | ≤ 70 | planned |

## Bundle budgets

| Metric | Soft (warn) | Hard (fail) |
|---|---:|---:|
| JS bundle delta per PR | +50 KB | +200 KB |
| Total JS bundle (prod, gzipped) | 1.2 MB | 1.6 MB |

## Definitions

- **TTI** — `react-native-performance` mark from route mount to first interactive paint with real data (post-loading-skeleton).
- **Scroll FPS** — flashlight average over a 30s automated scroll across the full list, mid-tier Android.
- **JS heap** — peak heap reported by Hermes during the flashlight run.

## Update protocol

1. Run flashlight + bundle measurement on `main` to capture baseline.
2. Open a PR that adjusts the budget with a one-paragraph rationale.
3. Reviewer signs off if the regression is justified (new feature, irreducible cost). Reject if it's neglect.
