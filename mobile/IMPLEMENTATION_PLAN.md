# Membership Auto Mobile App - Implementation Plan

## Project Overview
React Native mobile application for Membership Auto using Expo, with authentication, vehicle management, fuel tracking, appointments, and more.

---

## ✅ Phase 1: Project Foundation (COMPLETED)

### 1.1 Initial Setup
- [x] Initialize project from zerodays/react-native-template
- [x] Configure app.json with Membership Auto branding
- [x] Set up color scheme matching frontend (gold #cba86e, dark theme)
- [x] Update package.json with project dependencies

### 1.2 Dependencies Added
- [x] expo-camera (receipt scanning)
- [x] expo-location (parking reminder, store locator)
- [x] expo-secure-store (token storage)
- [x] expo-notifications (push notifications)
- [x] react-native-maps (store locator)
- [x] react-native-ble-plx (OBD-II dongle connection)
- [x] socket.io-client (real-time chat)
- [x] @hookform/resolvers (form validation)

### 1.3 Core Infrastructure
- [x] TypeScript types for all entities (User, Vehicle, Appointment, etc.)
- [x] Constants file with API URLs, storage keys, query keys
- [x] API client with axios (auto token refresh, error handling)
- [x] Auth service (login, register, logout, password reset)
- [x] Zustand stores (auth, vehicle)

### 1.4 UI Components
- [x] Custom TextInput component
- [x] Card component
- [x] QuickActionButton component
- [x] Button component (from template)
- [x] Dialog component (from template)
- [x] Loading component (from template)

### 1.5 Navigation Structure
- [x] Tab navigation with 5 main tabs (Home, Vehicles, Appointments, Offers, Profile)
- [x] Hidden screens (Mileage, Store Locator, Parking, Referrals, Chat, Help)
- [x] Dark theme applied to tabs and headers

### 1.6 Authentication Screens
- [x] Login screen with email/password validation
- [x] Sign-up screen with referral code support
- [x] Forgot password screen with email verification

### 1.7 Backend Integration (COMPLETED)
- [x] Auth service integrated with Django backend
- [x] Vehicle service with all CRUD endpoints
- [x] Offer service integrated
- [x] API client with auto token refresh on 401
- [x] Secure token storage (expo-secure-store)

---

## ✅ Phase 2: Core Screens (COMPLETED)

### 2.1 Dashboard/Home Screen ✅
**File:** `/app/(authenticated)/index.tsx`
**Status:** FULLY FUNCTIONAL WITH BACKEND INTEGRATION

**Completed Features:**
- [x] Membership status card (plan, renewal date)
- [x] Next scheduled service card (placeholder)
- [x] Active vehicle display (year, make, model, odometer, health)
- [x] No vehicles state when user has no vehicles
- [x] Grid of quick action buttons (8 items)
- [x] Special offers banner (shows count and title)
- [x] Pull-to-refresh functionality
- [x] Welcome message with user's first name

**Backend Endpoints Integrated:**
- [x] GET /users/profile/ (user data)
- [x] GET /vehicles/ (user vehicles)
- [x] GET /offers/ (special offers)

---

### 2.2 Vehicles Screen
**File:** `/app/(authenticated)/vehicles/index.tsx`
**Features:**
- [ ] List of user's vehicles with make, model, year
- [ ] Active vehicle indicator
- [ ] Add vehicle button
- [ ] Vehicle card showing:
  - Vehicle image
  - Make, model, year
  - Odometer reading
  - Health status (good/warning/critical)
  - OBD connection status

**Sub-screens:**
- [ ] `/vehicles/add.tsx` - Add new vehicle (VIN scanner, manual entry)
- [ ] `/vehicles/[id].tsx` - Vehicle details
- [ ] `/vehicles/[id]/pair-obd.tsx` - Pair OBD dongle via BLE

**API Endpoints Needed:**
- GET /vehicles
- POST /vehicles
- PUT /vehicles/{id}
- DELETE /vehicles/{id}
- GET /vehicles/{id}/health
- POST /vehicles/{id}/link-dongle

---

### 2.3 Appointments Screen
**File:** `/app/(authenticated)/appointments/index.tsx`
**Features:**
- [ ] Tabs: Upcoming, Past
- [ ] Appointment cards showing:
  - Date/time
  - Location
  - Vehicle
  - Services included
  - Status
  - Cancel/Reschedule buttons

**Sub-screens:**
- [ ] `/appointments/book.tsx` - Book new appointment
  - Select vehicle
  - Select location (map + list)
  - Select service package
  - Choose date/time from available slots
  - Confirm
- [ ] `/appointments/[id].tsx` - Appointment details

**API Endpoints Needed:**
- GET /appointments/upcoming
- GET /appointments/past
- GET /appointments/{id}
- POST /appointments/book
- GET /appointments/availability
- PUT /appointments/{id}/reschedule
- DELETE /appointments/{id}

---

### 2.4 Offers Screen
**File:** `/app/(authenticated)/offers/index.tsx`
**Features:**
- [ ] List of active offers with images
- [ ] Filter by membership level, location
- [ ] Offer cards showing:
  - Title, description
  - Expiry date
  - Terms
  - "Book with Offer" button

**Sub-screens:**
- [ ] `/offers/[id].tsx` - Offer details

**API Endpoints Needed:**
- GET /offers?userId=&vehicleId=&location=

---

### 2.5 Profile Screen
**File:** `/app/(authenticated)/profile/index.tsx`
**Features:**
- [ ] User info section (name, email, phone)
- [ ] Membership plan and status
- [ ] Billing information (read-only)
- [ ] Settings:
  - Notification preferences
  - Language
  - App version
- [ ] Logout button

**Sub-screens:**
- [ ] `/profile/edit.tsx` - Edit profile
- [ ] `/profile/settings.tsx` - App settings
- [ ] `/profile/membership.tsx` - Membership details

**API Endpoints Needed:**
- GET /auth/profile
- PUT /auth/profile
- GET /membership
- PUT /devices/register (push token)

---

## 📋 Phase 3: Additional Features

### 3.1 Mileage Tracker
**File:** `/app/(authenticated)/mileage/index.tsx`
**Features:**
- [ ] Toggle: Automatic (OBD) vs Manual mode
- [ ] Charts showing:
  - Average MPG (30 days)
  - Cost per mile
  - Fuel consumption trend
- [ ] Fuel log list (date, gallons, cost, MPG)
- [ ] "Add Fill-Up" button (manual mode)

**Sub-screens:**
- [ ] `/mileage/add-fillup.tsx` - Add manual fuel log
  - Camera to scan receipt/pump
  - OCR extraction of gallons, price, cost
  - Manual odometer entry
  - Confirm and submit

**API Endpoints Needed:**
- GET /vehicles/{id}/fuel-logs
- GET /vehicles/{id}/fuel-stats
- POST /vehicles/{id}/fuel-logs
- POST /fuel-ocr (image → structured data)

---

### 3.2 Store Locator
**File:** `/app/(authenticated)/store-locator/index.tsx`
**Features:**
- [ ] Map view with location markers
- [ ] List view of locations
- [ ] Location cards showing:
  - Name, address
  - Distance from user
  - Phone number
  - Hours
  - "Get Directions" button
  - "Book Appointment" button

**API Endpoints Needed:**
- GET /locations?lat=&lng=&radius=

**Libraries:**
- react-native-maps
- expo-location

---

### 3.3 Parking Reminder
**File:** `/app/(authenticated)/parking/index.tsx`
**Features:**
- [ ] "Save Parking Spot" button
  - Captures GPS location
  - Optional: level, spot number, notes
  - Optional: take photos
- [ ] "Navigate to My Car" button
- [ ] Parking meter timer with notification
- [ ] Saved spot details (map, address, time)

**API Endpoints Needed:**
- POST /parking/save
- GET /parking/current
- DELETE /parking/clear

**Libraries:**
- expo-location
- expo-notifications (timer alert)

---

### 3.4 Referrals
**File:** `/app/(authenticated)/referrals/index.tsx`
**Features:**
- [ ] Referral code display
- [ ] Referral link
- [ ] "Share" button (native share sheet)
- [ ] "Copy Code" button
- [ ] Referral stats:
  - Total referrals
  - Successful conversions
  - Rewards earned
- [ ] List of referred users with status

**API Endpoints Needed:**
- GET /referrals/me
- POST /referrals/apply (used during sign-up)

---

### 3.5 Chat/Messaging
**File:** `/app/(authenticated)/chat/index.tsx`
**Features:**
- [ ] Thread list (or single support thread)
- [ ] Unread message badge
- [ ] Message bubbles (user vs agent)
- [ ] Text input with send button
- [ ] Optional: image attachments

**Sub-screens:**
- [ ] `/chat/[threadId].tsx` - Message thread

**API Endpoints Needed:**
- GET /chats/threads
- GET /chats/threads/{id}/messages
- POST /chats/threads/{id}/messages
- WebSocket connection for real-time messages

**Libraries:**
- socket.io-client

---

### 3.6 Help & Support
**File:** `/app/(authenticated)/help/index.tsx`
**Features:**
- [ ] FAQ sections
- [ ] Membership inclusions summary
- [ ] "Call Support" button (tel link)
- [ ] "Email Support" button (mailto link)
- [ ] "Open Chat" button
- [ ] "Submit Ticket" form

**Sub-screens:**
- [ ] `/help/contact.tsx` - Contact form
- [ ] `/help/faq.tsx` - FAQ list

**API Endpoints Needed:**
- GET /help/faqs
- POST /support/tickets

---

## 📋 Phase 4: Advanced Features

### 4.1 OBD-II Integration
**Files:**
- `services/obd/obd.service.ts`
- `services/obd/obd-commands.ts`

**Features:**
- [ ] BLE device scanning
- [ ] Connect to OBD dongle
- [ ] Request standard PIDs:
  - Vehicle speed
  - Fuel level
  - Fuel rate
  - Odometer (if supported)
  - DTCs (diagnostic codes)
- [ ] Batch telemetry upload to backend

**API Endpoints Needed:**
- POST /telematics/{vehicleId}

**Libraries:**
- react-native-ble-plx

---

### 4.2 Push Notifications
**Files:**
- `services/notifications/push.service.ts`

**Features:**
- [ ] Register device token on login
- [ ] Handle foreground notifications
- [ ] Handle background notifications
- [ ] Deep linking from notifications
- [ ] Notification types:
  - Appointment reminders
  - Service due alerts
  - New offers
  - Chat messages
  - Referral success

**API Endpoints Needed:**
- POST /devices/register

**Libraries:**
- expo-notifications

---

### 4.3 Offline Support
**Features:**
- [ ] Cache user data locally
- [ ] Queue API requests when offline
- [ ] Sync when back online
- [ ] Offline indicators

**Libraries:**
- @react-native-async-storage/async-storage
- @tanstack/react-query (with persistence)

---

## 📋 Phase 5: Testing & Polish

### 5.1 Testing
- [ ] Unit tests for services
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows (login, booking)
- [ ] Test on iOS physical device
- [ ] Test on Android physical device

### 5.2 Assets
- [ ] App icon (1024x1024)
- [ ] Splash screen
- [ ] Notification icon
- [ ] Vehicle placeholder images
- [ ] Social media icons

### 5.3 Localization (Optional)
- [ ] i18n setup (already in template)
- [ ] Translation files for key strings

### 5.4 Performance
- [ ] Image optimization
- [ ] List virtualization (FlatList)
- [ ] Code splitting
- [ ] Bundle size analysis

### 5.5 Security
- [ ] Secure token storage (expo-secure-store)
- [ ] Certificate pinning
- [ ] Code obfuscation for production

---

## 📋 Phase 6: Deployment

### 6.1 Backend Integration
- [ ] Point API_BASE_URL to production backend
- [ ] Test all endpoints with live data
- [ ] Handle API versioning

### 6.2 iOS Deployment
- [ ] Configure app signing
- [ ] Set up Apple Developer account
- [ ] Create App Store listing
- [ ] Submit for review
- [ ] Handle TestFlight distribution

### 6.3 Android Deployment
- [ ] Configure app signing (keystore)
- [ ] Set up Google Play Console
- [ ] Create Play Store listing
- [ ] Submit for review
- [ ] Handle internal/alpha/beta testing

### 6.4 CI/CD
- [ ] GitHub Actions for linting
- [ ] GitHub Actions for builds (EAS Build)
- [ ] Automated testing pipeline
- [ ] Automated deployments to TestFlight/Play Store

---

## API Endpoints Summary

### Authentication
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/verify-email
- POST /auth/refresh
- GET /auth/profile
- PUT /auth/profile
- POST /auth/change-password

### Vehicles
- GET /vehicles
- POST /vehicles
- GET /vehicles/{id}
- PUT /vehicles/{id}
- DELETE /vehicles/{id}
- GET /vehicles/{id}/health
- POST /vehicles/{id}/link-dongle

### Appointments
- GET /appointments/upcoming
- GET /appointments/past
- GET /appointments/{id}
- POST /appointments/book
- GET /appointments/availability
- PUT /appointments/{id}/reschedule
- DELETE /appointments/{id}

### Offers
- GET /offers

### Locations
- GET /locations

### Fuel
- GET /vehicles/{id}/fuel-logs
- GET /vehicles/{id}/fuel-stats
- POST /vehicles/{id}/fuel-logs
- POST /fuel-ocr

### Telematics
- POST /telematics/{vehicleId}

### Referrals
- GET /referrals/me
- POST /referrals/apply

### Chat
- GET /chats/threads
- GET /chats/threads/{id}/messages
- POST /chats/threads/{id}/messages
- WebSocket /chat

### Notifications
- POST /devices/register

### Config
- GET /config/social

### Help
- GET /help/faqs
- POST /support/tickets

### Parking
- POST /parking/save
- GET /parking/current
- DELETE /parking/clear

### Membership
- GET /membership

---

## File Structure

```
mobile/
├── app/
│   ├── (authenticated)/
│   │   ├── _layout.tsx ✅
│   │   ├── index.tsx (Dashboard) ⏳
│   │   ├── vehicles/
│   │   │   ├── index.tsx
│   │   │   ├── add.tsx
│   │   │   ├── [id].tsx
│   │   │   └── [id]/pair-obd.tsx
│   │   ├── appointments/
│   │   │   ├── index.tsx
│   │   │   ├── book.tsx
│   │   │   └── [id].tsx
│   │   ├── offers/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── profile/
│   │   │   ├── index.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── settings.tsx
│   │   │   └── membership.tsx
│   │   ├── mileage/
│   │   │   ├── index.tsx
│   │   │   └── add-fillup.tsx
│   │   ├── store-locator/
│   │   │   └── index.tsx
│   │   ├── parking/
│   │   │   └── index.tsx
│   │   ├── referrals/
│   │   │   └── index.tsx
│   │   ├── chat/
│   │   │   ├── index.tsx
│   │   │   └── [threadId].tsx
│   │   └── help/
│   │       ├── index.tsx
│   │       ├── contact.tsx
│   │       └── faq.tsx
│   ├── (guest)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx (Login) ✅
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   └── _layout.tsx ✅
├── components/
│   └── ui/
│       ├── button.tsx ✅
│       ├── card.tsx ✅
│       ├── text-input.tsx ✅
│       ├── quick-action-button.tsx ✅
│       ├── dialog.tsx ✅
│       ├── loading.tsx ✅
│       └── toaster.tsx ✅
├── services/
│   └── api/
│       ├── client.ts ✅
│       ├── auth.service.ts ✅
│       ├── vehicle.service.ts
│       ├── appointment.service.ts
│       ├── offer.service.ts
│       ├── fuel.service.ts
│       ├── referral.service.ts
│       ├── chat.service.ts
│       ├── location.service.ts
│       └── notification.service.ts
├── stores/
│   ├── auth.store.ts ✅
│   ├── vehicle.store.ts ✅
│   ├── appointment.store.ts
│   └── notification.store.ts
├── types/
│   └── index.ts ✅
├── constants/
│   └── index.ts ✅
├── utils/
│   ├── theme.js ✅
│   └── cn.ts (from template)
├── package.json ✅
├── app.json ✅
├── tailwind.config.js ✅
└── IMPLEMENTATION_PLAN.md ✅

✅ = Completed
⏳ = In Progress
Empty = Not Started
```

---

## Next Steps (Priority Order)

1. **Install Dependencies**
   ```bash
   cd mobile
   yarn install
   ```

2. **Create Sign-Up Screen**
   - File: `app/(guest)/sign-up.tsx`
   - Similar to login with additional fields

3. **Create Dashboard Screen**
   - File: `app/(authenticated)/index.tsx`
   - Membership card, next service, quick actions

4. **Create Vehicles Screens**
   - List, add, details

5. **Create Appointments Screens**
   - List, book, details

6. **Continue with remaining screens**
   - Follow the phase-by-phase plan above

---

## Development Commands

```bash
# Start development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run on physical device
yarn ios --device
yarn android --device

# Lint code
yarn lint

# Format code
yarn format:fix

# Generate API client from OpenAPI spec
yarn gen-api

# Build for production (iOS)
yarn ios:production

# Build for production (Android)
yarn android:production
```

---

## Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.membershipauto.com
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_SENTRY_ENV=development
```

For production, use Infisical or environment-specific `.env` files.

---

## Notes

- The template uses **Infisical** for secret management in scripts
- Remove or configure Infisical based on your needs
- **Orval** can auto-generate API clients from OpenAPI spec
- All screens should follow the dark theme with gold accents
- Use React Query for server state management
- Use Zustand for client state
- Prioritize type safety throughout

---

## Estimated Timeline

- Phase 1 (Foundation): ✅ **2 days** (COMPLETED)
- Phase 2 (Core Screens): **1-2 weeks**
- Phase 3 (Additional Features): **1-2 weeks**
- Phase 4 (Advanced Features): **1 week**
- Phase 5 (Testing & Polish): **1 week**
- Phase 6 (Deployment): **3-5 days**

**Total: 4-6 weeks** for a complete MVP

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Native BLE PLX](https://github.com/dotintent/react-native-ble-plx)
