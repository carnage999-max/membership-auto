# Membership Auto Mobile App

Premium automotive membership mobile application built with React Native and Expo.

## 🚀 Features

- 🔐 **Authentication** - Secure login, registration, and password reset
- 🚗 **Vehicle Management** - Track multiple vehicles with health monitoring
- 📅 **Appointments** - Book and manage service appointments
- ⛽ **Fuel Tracking** - Automatic (OBD-II) and manual fuel economy tracking
- 🏪 **Store Locator** - Find nearby service centers with map integration
- 🅿️ **Parking Reminder** - Save parking location with GPS
- 🎁 **Offers** - View and redeem special promotions
- 👥 **Referrals** - Earn rewards by referring friends
- 💬 **Live Chat** - Real-time support messaging
- 🔔 **Push Notifications** - Appointment reminders and alerts

## 📱 Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Styling:** NativeWind (TailwindCSS)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod validation
- **API Client:** Axios with auto-refresh
- **Maps:** React Native Maps
- **Bluetooth:** React Native BLE PLX (for OBD-II)
- **Real-time:** Socket.IO Client

## 🏗️ Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (authenticated)/   # Protected routes (tabs)
│   │   ├── index.tsx     # Dashboard ✅
│   │   ├── vehicles/     # Vehicle management
│   │   ├── appointments/ # Appointments
│   │   ├── offers/       # Special offers
│   │   ├── profile/      # User profile
│   │   └── ...
│   └── (guest)/          # Public routes
│       ├── index.tsx     # Login screen ✅
│       ├── sign-up.tsx   # Registration
│       └── ...
├── components/           # Reusable UI components ✅
├── services/api/         # API client and services ✅
├── stores/               # Zustand state stores ✅
├── types/                # TypeScript definitions ✅
├── constants/            # App constants ✅
└── utils/                # Utility functions
```

## 🎨 Color Scheme

Brand colors matching the website:

- **Primary (Gold):** `#cba86e`
- **Background:** `#0d0d0d`
- **Surface:** `#1a1a1a`
- **Border:** `#2a2a2a`
- **Success:** `#4caf50`
- **Error:** `#dd4a48`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

### Environment Setup

Create `.env` file:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.membershipauto.com
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_SENTRY_ENV=development
```

## 📚 Documentation

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Complete implementation roadmap with all features, screens, and API endpoints
- **[README_TEMPLATE.md](./README_TEMPLATE.md)** - Original template documentation

## 🔧 Development

### Code Quality

- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Husky for git hooks
- Conventional Commits

### Available Scripts

```bash
yarn start          # Start Expo dev server
yarn ios            # Run on iOS
yarn android        # Run on Android
yarn lint           # Run ESLint
yarn format:fix     # Format code
yarn gen-api        # Generate API client
```

## 🏗️ Current Status

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Project initialization
- [x] Color scheme configuration
- [x] TypeScript types
- [x] API client with auth
- [x] Zustand stores (auth, vehicle)
- [x] UI components (Button, TextInput, Card, etc.)
- [x] Tab navigation structure
- [x] Login screen

### ⏳ Phase 2: Core Screens (IN PROGRESS)
- [ ] Dashboard screen
- [ ] Vehicles screens
- [ ] Appointments screens
- [ ] Offers screens
- [ ] Profile screen

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for full roadmap.

## 🚀 Deployment

### iOS

```bash
yarn ios:production
eas submit -p ios
```

### Android

```bash
yarn android:production
eas submit -p android
```

## 📖 Key Features Documentation

### Authentication Flow
1. User logs in → JWT tokens stored securely
2. Auto token refresh on 401
3. Automatic navigation based on auth state

### API Integration
All services are type-safe and located in `/services/api/`:
- `auth.service.ts` - Authentication
- `vehicle.service.ts` - Vehicle management
- `appointment.service.ts` - Appointments
- More services to be added

### State Management
- **Zustand** for client state (auth, vehicles)
- **TanStack Query** for server state (caching, refetching)

## 🐛 Troubleshooting

```bash
# Clear cache
yarn start -c

# Reinstall dependencies
rm -rf node_modules && yarn install

# iOS pod install
cd ios && pod install && cd ..
```

## 📄 License

Proprietary - Membership Auto © 2025

---

**For detailed implementation plan, see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**
