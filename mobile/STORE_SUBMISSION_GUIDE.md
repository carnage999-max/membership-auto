# Membership Auto - App Store Submission Guide

## ✅ Pre-Submission Checklist

### **1. App Information**
- **App Name**: Membership Auto
- **Bundle ID (iOS)**: com.membershipauto.app
- **Package Name (Android)**: com.membershipauto.app
- **Version**: 1.0.0
- **Category**: Lifestyle / Automotive
- **Content Rating**: Everyone (4+)

---

## 📱 Required Assets

### **App Icon**
- ✅ **Location**: `mobile/assets/icon.png`
- **Size**: 1024x1024px
- **Format**: PNG (no transparency)
- **Current**: Already exists (/home/binary/Desktop/membership-auto/mobile/assets/icon.png - 146KB)

### **Adaptive Icon (Android)**
- ✅ **Location**: `mobile/assets/adaptive-icon.png`
- **Size**: 1024x1024px
- **Format**: PNG
- **Current**: Already exists

### **Splash Screen**
- ✅ **Location**: `mobile/assets/splash.png`
- **Background**: White (#FFFFFF) ✅ UPDATED
- **Size**: 2048x2048px recommended
- **Format**: PNG
- **Current**: Already exists with white background

### **Notification Icon (Android)**
- ✅ **Location**: `mobile/assets/notification-icon.png`
- **Size**: 96x96px
- **Format**: PNG
- **Current**: Already exists (7.4KB)

---

## 🔐 Privacy & Legal Requirements

### **Privacy Policy** ✅ COMPLETED
- **URL**: https://www.membershipauto.com/privacy
- **Status**: ✅ Live and accessible
- **Coverage**: GDPR, CCPA, COPPA compliant
- **File**: `/frontend/app/privacy/page.tsx`

### **Data Deletion** ✅ COMPLETED
- **URL**: https://www.membershipauto.com/data-deletion
- **Status**: ✅ Created with backend integration
- **Backend Endpoint**: `/api/users/request-deletion/`
- **File**: `/frontend/app/data-deletion/page.tsx`

### **Terms of Service** ✅ COMPLETED
- **URL**: https://www.membershipauto.com/terms
- **Status**: ✅ Live and accessible
- **File**: `/frontend/app/terms/page.tsx`

---

## 📝 Permissions Declarations (Already Configured)

### **Location Permission**
```json
{
  "locationAlwaysAndWhenInUsePermission": "Allow Membership Auto to access your location for parking reminders and store locator."
}
```
**Used for**: Parking reminders, Store locator

### **Camera Permission**
```json
{
  "cameraPermission": "Allow Membership Auto to access your camera to scan receipts and vehicle documents."
}
```
**Used for**: Receipt scanning, Document uploads

### **Photo Library Permission**
```json
{
  "photosPermission": "Allow Membership Auto to access your photos to upload receipts and vehicle images."
}
```
**Used for**: Vehicle image uploads, Receipt uploads

### **Notifications Permission**
```json
{
  "icon": "./assets/notification-icon.png",
  "color": "#cba86e"
}
```
**Used for**: Service reminders, Appointment notifications, Offer alerts

---

## 🖼️ Store Listing Screenshots

### **Required Screenshot Sizes**

#### **iOS App Store**
1. **iPhone 6.7"** (iPhone 14 Pro Max, 15 Pro Max)
   - Size: 1290 x 2796 px
   - Minimum: 3 screenshots
   - Maximum: 10 screenshots

2. **iPhone 6.5"** (iPhone 11 Pro Max, XS Max)
   - Size: 1242 x 2688 px
   - Minimum: 3 screenshots

3. **iPhone 5.5"** (iPhone 8 Plus, 7 Plus)
   - Size: 1242 x 2208 px
   - Optional but recommended

#### **Google Play Store**
1. **Phone Screenshots**
   - Minimum: 2 screenshots
   - Maximum: 8 screenshots
   - Size: 1080 x 1920 px (16:9 ratio)
   - Format: PNG or JPG

2. **Feature Graphic** (Required)
   - Size: 1024 x 500 px
   - Format: PNG or JPG
   - Note: Will be shown at top of store listing

### **Recommended Screenshots to Capture**
1. **Home Screen** - Showing membership status
2. **Plans Page** - Displaying membership options
3. **Vehicles Page** - Vehicle management
4. **Appointments** - Booking interface
5. **Special Offers** - Deals and promotions
6. **Profile/Account** - User settings

---

## 📄 App Description Templates

### **Short Description (80 characters max)**
```
All-in-one auto maintenance membership. Book service, track miles, save money.
```

### **Full Description**

```
Membership Auto - Your Complete Vehicle Care Solution

Tired of unexpected car repair bills? Membership Auto provides unlimited automotive maintenance for one low monthly fee. From oil changes to brake service, we've got you covered.

KEY FEATURES:
✓ Unlimited Services - Oil changes, tire rotations, fluid top-offs, and more
✓ Easy Booking - Schedule appointments in seconds
✓ Mileage Tracker - Monitor your vehicle's health automatically
✓ Parking Reminders - Never forget where you parked
✓ Store Locator - Find the nearest service center
✓ Special Offers - Exclusive member discounts
✓ Service History - Track all maintenance in one place
✓ Multiple Vehicles - Manage your entire fleet

MEMBERSHIP PLANS:
• Basic - Essential maintenance ($59/mo)
• Plus - Enhanced coverage ($79/mo)
• Premium - Complete care ($99/mo)
• Elite - Luxury service ($159/mo)

WHY MEMBERSHIP AUTO?
✓ No surprise costs - predictable monthly billing
✓ Priority scheduling for members
✓ Nationwide coverage at all locations
✓ 30-day money-back guarantee
✓ Cancel anytime with no penalty

Download now and experience hassle-free vehicle maintenance!

SUPPORT:
Questions? Contact us at support@membershipauto.com or call 207-947-1999

Privacy Policy: https://www.membershipauto.com/privacy
Terms of Service: https://www.membershipauto.com/terms
```

### **Keywords (Google Play - max 5, iOS - max 100 characters)**

**iOS (comma-separated, 100 chars)**:
```
auto maintenance,car service,oil change,vehicle care,membership,tire rotation
```

**Google Play (max 5)**:
1. auto maintenance
2. car service membership
3. oil change
4. vehicle maintenance
5. automotive care

---

## 🎯 Content Rating Questionnaire

### **Violence**: No
### **Sexual Content**: No
### **Profanity**: No
### **Gambling**: No
### **Drugs/Alcohol/Tobacco**: No
### **User-Generated Content**: No
### **Social Features**: No
### **Location Sharing**: Yes (for parking reminders and store locator)
### **Data Collection**: Yes (as detailed in Privacy Policy)

**Recommended Rating**: 
- **iOS**: 4+
- **Android**: Everyone

---

## 🚀 Build & Upload Steps

### **1. Update Version & Build Number**
In `app.json`:
```json
{
  "version": "1.0.0",
  "ios": {
    "buildNumber": "1"
  },
  "android": {
    "versionCode": 1
  }
}
```

### **2. Build for Production**

#### **iOS (via EAS Build)**
```bash
cd mobile
eas build --platform ios --profile production
```

#### **Android (via EAS Build)**
```bash
cd mobile
eas build --platform android --profile production
```

### **3. Submit to Stores**

#### **iOS App Store**
```bash
eas submit --platform ios
```

#### **Google Play Store**
```bash
eas submit --platform android
```

---

## 📋 Store Listing Information

### **App Store Connect (iOS)**

1. **App Information**
   - Primary Language: English (U.S.)
   - Primary Category: Lifestyle
   - Secondary Category: Business (optional)
   - Content Rights: Yes, it contains third-party content

2. **Pricing & Availability**
   - Price: Free
   - Available in: All countries
   - In-App Purchases: Yes (membership subscriptions)

3. **Privacy**
   - Privacy Policy URL: https://www.membershipauto.com/privacy
   - Data Deletion URL: https://www.membershipauto.com/data-deletion

4. **App Review Information**
   - Contact: support@membershipauto.com
   - Phone: 207-947-1999
   - Demo Account: Provide test credentials
   - Notes: "App requires membership for full features. Test account provided."

### **Google Play Console (Android)**

1. **Store Listing**
   - App Name: Membership Auto
   - Short Description: (80 chars max - see template above)
   - Full Description: (4000 chars max - see template above)
   - App Icon: 512 x 512 px PNG
   - Feature Graphic: 1024 x 500 px

2. **Data Safety**
   - Does app collect or share user data?: Yes
   - Data types collected:
     - Personal info (name, email, phone)
     - Location (for parking reminders)
     - Financial info (payment methods)
     - Photos (vehicle images)
     - App activity (service history)
   - Data sharing: No data shared with third parties
   - Data deletion: https://www.membershipauto.com/data-deletion

3. **Content Rating**
   - Target age: Everyone
   - Ads: No
   - In-app purchases: Yes

---

## 🔍 App Review Preparation

### **Test Account for Reviewers**
Create a test account with:
- Email: reviewer@membershipauto.com
- Password: (secure password)
- Active Premium membership
- Sample vehicle data
- Sample appointments

### **Review Notes Template**
```
MEMBERSHIP AUTO - APP REVIEW NOTES

Thank you for reviewing Membership Auto!

TEST CREDENTIALS:
Email: reviewer@membershipauto.com
Password: [provided separately]

IMPORTANT NOTES:
1. The test account has an active Premium membership
2. Sample vehicles and appointments are pre-loaded
3. All features are functional except Stripe payments (test mode)

MAIN FEATURES TO TEST:
✓ Login with provided credentials
✓ View home dashboard showing membership status
✓ Browse membership plans
✓ View vehicle list and details
✓ Book a test appointment
✓ View special offers
✓ Check profile and settings
✓ Test parking reminder feature
✓ Use store locator

PERMISSIONS USAGE:
- Location: Used for parking reminders and store locator
- Camera: Used for receipt scanning and vehicle documentation
- Photos: Used for uploading vehicle images
- Notifications: Used for appointment reminders and offers

PRIVACY & DATA:
- Privacy Policy: https://www.membershipauto.com/privacy
- Data Deletion: https://www.membershipauto.com/data-deletion
- All user data is encrypted and secured

CONTACT:
For any questions during review:
- Email: support@membershipauto.com
- Phone: 207-947-1999

Thank you!
```

---

## ✅ Final Pre-Flight Checklist

Before submitting:

### **Technical**
- [ ] App builds successfully on both iOS and Android
- [ ] No crashes or critical bugs
- [ ] All features work as expected
- [ ] Network errors handled gracefully
- [ ] Loading states implemented
- [ ] Deep linking works (membershipauto://)

### **Content**
- [ ] App icon is clear and recognizable
- [ ] Screenshots show key features
- [ ] Description is compelling and accurate
- [ ] Keywords are relevant
- [ ] All text is proofread

### **Legal**
- [ ] Privacy Policy is live and accessible
- [ ] Data Deletion page is live and functional
- [ ] Terms of Service are accessible
- [ ] All required permissions are justified
- [ ] Copyright notices are in place

### **Store Presence**
- [ ] All required screenshots uploaded
- [ ] Feature graphic created (Android)
- [ ] App description optimized
- [ ] Keywords selected
- [ ] Content rating completed
- [ ] Test account created for reviewers

---

## 🎉 Post-Submission

### **Expected Timeline**
- **iOS**: 24-48 hours (sometimes up to 7 days)
- **Android**: 1-3 days

### **Common Rejection Reasons & Fixes**
1. **Broken Links**: Test all URLs before submission
2. **Missing Permissions Justification**: Ensure all permission descriptions are clear
3. **Crash on Launch**: Test thoroughly on multiple devices
4. **Misleading Metadata**: Screenshots must match actual app functionality
5. **Privacy Policy Issues**: Ensure privacy policy URL works and is comprehensive

### **If Rejected**
1. Read rejection reason carefully
2. Fix the specific issue mentioned
3. Test the fix thoroughly
4. Reply to reviewer with fix details
5. Resubmit

---

## 📞 Support Contacts

**For App Store Issues**:
- Apple Developer Support: https://developer.apple.com/contact/
- Google Play Support: https://support.google.com/googleplay/android-developer/

**For App Issues**:
- Email: support@membershipauto.com
- Phone: 207-947-1999

---

## 🔗 Quick Links

- **Privacy Policy**: https://www.membershipauto.com/privacy
- **Data Deletion**: https://www.membershipauto.com/data-deletion
- **Terms of Service**: https://www.membershipauto.com/terms
- **Support Email**: support@membershipauto.com
- **Privacy Email**: privacy@membershipauto.com

---

**Good luck with your submission! 🚀**
