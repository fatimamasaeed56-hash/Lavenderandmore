---
name: Geolocation permission waits
description: Browser permission prompts can leave location requests unresolved.
---
Keep manual entry and dismissal available while waiting for geolocation permission; ignore late callbacks after cancellation.

**Why:** Mobile browser testing left permission at `prompt` without either geolocation callback firing. The API timeout alone did not free the interface.

**How to apply:** Use an independent UI timeout and cancellation guard for location requests. Do not disable all fallback actions while awaiting permission.