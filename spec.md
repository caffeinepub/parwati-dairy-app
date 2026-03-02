# Specification

## Summary
**Goal:** Add daily order records for regular customers and restrict admin-only pages/data using Internet Identity principal-based authentication.

**Planned changes:**
- Add `DailyOrderRecord` type to the backend with fields: recordId, customerId, date, quantityDelivered, amountCharged, and optional notes
- Implement backend functions: `addDailyOrderRecord`, `getDailyOrderRecordsByCustomer`, `getAllDailyOrderRecords`, and `deleteDailyOrderRecord`, stored in stable HashMap with auto-incrementing recordId
- Add admin principal storage to the backend with an `isAdmin` query function; gate `getRegularCustomers`, `addRegularCustomer`, `updateRegularCustomer`, `recordDailyDelivery`, `recordPayment`, `getAllDailyOrderRecords`, `deleteDailyOrderRecord`, and `getAllOrders` to admin-only callers
- Add TanStack Query hooks: `useAddDailyOrderRecord`, `useDailyOrderRecordsByCustomer`, `useDeleteDailyOrderRecord`, and `useIsAdmin`
- Add a "Daily Orders" button to each customer card on the RegularCustomers page that opens a dialog showing that customer's daily order records in a table (Date, Quantity, Amount, Notes) with an inline "Add Daily Record" form and per-row delete buttons
- Wrap the RegularCustomers page and OrderHistory page with an admin access guard; non-admin users see an "Admin Access Required" message with a login button

**User-visible outcome:** Admins can log in with Internet Identity to access customer details, view and manage daily order records per customer, and see full order history. Non-admin users are shown an access-denied screen on protected pages.
