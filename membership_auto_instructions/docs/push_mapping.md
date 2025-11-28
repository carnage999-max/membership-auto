Push Notification Mapping
=========================

Event -> Template -> Deep link (app)

- appointment.upcoming
  - "Reminder: Appointment in 2 hours at {location}"
  - app://appointments/{id}
- telematics.alert
  - "Vehicle alert: {shortMessage}"
  - app://vehicle/{vehicleId}/alerts
- offer.new
  - "New offer near you: {title}"
  - app://offers/{id}
- referral.success
  - "Your friend joined! 1 free month added."
  - app://referrals
- chat.message
  - "{sender}: {snippet}"
  - app://chat/{threadId}

Registration:
- POST /devices/register { userId, platform, pushToken, deviceInfo }

