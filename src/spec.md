# Specification

## Summary
**Goal:** Make the QR code on the OrderForm page clickable to redirect users to PhonePe for payment.

**Planned changes:**
- Wrap the existing QR code image in a clickable element on the OrderForm page
- Add click handler to open PhonePe app (on mobile) or PhonePe web interface (fallback)
- Add visual feedback (pointer cursor, hover effect) to indicate the QR code is clickable

**User-visible outcome:** Users can click on the QR code image to be redirected to PhonePe, where they can complete payment using the displayed QR code.
