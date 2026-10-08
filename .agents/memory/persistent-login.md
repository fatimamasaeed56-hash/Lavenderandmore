---
name: Persistent login
description: Owner wants returning customers kept signed in on the same browser.
---
Keep customers signed in after their first login on the same device/browser, using a rolling 30-day session rather than storing passwords.

**Why:** The owner requested automatic login on return instead of repeated password entry. A finite inactivity window preserves logout and expiry security.

**How to apply:** Renew browser and database expiry together only for valid authenticated sessions. Never persist passwords or bypass provider validation. Clearing browser data, explicit logout, or revoked authentication can still require sign-in.

The owner explicitly approved email/password accounts inside the store alongside the existing provider sign-in, not replacing it.

**Why:** Customers should be able to choose a store password while existing customers retain their original sign-in option.

**How to apply:** Do not automatically link accounts by matching email, or add a password to an existing provider identity without proof of ownership. Only salted password hashes belong in the database; never return them in auth responses or session user data.
