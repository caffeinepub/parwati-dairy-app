# Parwati Dairy App

## Current State
The app has a Motoko backend with admin credential setup via `setAdminCredentials`. The current implementation requires the caller to already be an admin in the access control system before they can create admin credentials — making first-time setup impossible (chicken-and-egg problem). Users see an error when trying to set up their admin account.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `setAdminCredentials` backend function: Remove the access control admin check so that first-time setup is allowed for any caller when no credentials exist yet. Once credentials are set, the function returns false (user must use `changeAdminCredentials` to update).

### Remove
- The `AccessControl.isAdmin` guard from `setAdminCredentials`

## Implementation Plan
1. Regenerate the Motoko backend with the fixed `setAdminCredentials` function that allows first-time setup without requiring access control admin status.
2. All other backend logic remains identical (order management, customer records, delivery scheduling, daily order records, change password flow, etc.).
