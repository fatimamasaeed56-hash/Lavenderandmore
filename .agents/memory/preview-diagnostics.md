---
name: Preview diagnostics
description: Environment and screenshot pitfalls observed while diagnosing category navigation.
---
Workflow failures may coexist with stale servers still serving the app.

**Why:** Preview diagnosis found many duplicate sandbox Vite processes and old storefront/API processes occupying the managed ports. Repeated restarts alone would not free those ports.

**How to apply:** On address-in-use failures, inspect actual process ownership before restarting again; preserve managed workflow definitions.

Wait for drawer transitions to settle before treating clipped screenshots as layout bugs.

**Why:** Browser snapshots taken during the mobile drawer animation looked blank or showed the previous category; settled captures and computed bounds showed correct navigation without a runtime error.

**How to apply:** Compare settled pixels, DOM state, and the URL before changing navigation code.
