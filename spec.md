# Parwati Dairy App

## Current State
Admin login uses username/password with SHA-256 hashing. `adminLogin` is a `public query func` in the backend. Order History and Delivery Schedule backend functions (`getOrderHistory`, `getDeliverySchedule`) require `AccessControl.hasPermission(caller, #user)` which fails for anonymous callers (all non-II users). This causes errors on those pages and potentially stale-read failures on login.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `adminLogin` backend: change from `public query func` to `public shared func` so it always reads committed (not replicated/potentially stale) state
- `getOrderHistory` backend: remove `#user` permission check — this is a public customer-facing query; keep per-customer ownership check only for non-admins or remove entirely since there's no IC identity auth
- `getDeliverySchedule` backend: remove `#user` permission check for the same reason
- `getDailyOrderRecordsByCustomer` backend: remove `#user` permission check (admin check below it is sufficient)

### Remove
- Nothing

## Implementation Plan
1. In `main.mo`: change `adminLogin` to `public shared func`
2. In `main.mo`: remove `AccessControl.hasPermission(caller, #user)` trap from `getOrderHistory`, `getDeliverySchedule`, and `getDailyOrderRecordsByCustomer`
3. Validate frontend (no changes needed)
