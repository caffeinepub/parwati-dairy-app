# Specification

## Summary
**Goal:** Enable PhonePe deep linking, live order total calculation, delivery date visibility, and automated SMS order confirmations.

**Planned changes:**
- Fix PhonePe QR code to open PhonePe app on mobile using phonepe:// deep link
- Add real-time total amount calculation on OrderForm (quantity × product rate)
- Display delivery date for each order on DeliverySchedule page
- Implement backend SMS notification system to send order confirmations to customer mobile numbers

**User-visible outcome:** Customers can tap the QR code to launch PhonePe directly, see their order total update as they enter quantity, view delivery dates in their schedule, and receive SMS confirmations after placing orders.
