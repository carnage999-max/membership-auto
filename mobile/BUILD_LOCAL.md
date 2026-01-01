# Building APK and AAB Locally with Gradle

## Prerequisites

1. **Java JDK 17** (required for Android builds):
```bash
java -version
# Should show version 17.x
```

If not installed:
```bash
sudo apt install openjdk-17-jdk
```

2. **Android SDK** (comes with Android Studio or can be installed standalone)

---

## Quick Start

### Build APK (for testing):
```bash
cd /home/binary/Desktop/membership-auto/mobile/android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Build AAB (for Google Play):
```bash
cd /home/binary/Desktop/membership-auto/mobile/android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Detailed Build Steps

### 1. Pre-build Preparation

```bash
cd /home/binary/Desktop/membership-auto/mobile

# Make sure dependencies are installed
npm install

# Pre-build the Expo project (generates native code)
npx expo prebuild --platform android --clean
```

### 2. Build APK

```bash
cd android
./gradlew assembleRelease
```

**What happens:**
- ✅ Compiles JavaScript bundle
- ✅ Builds native Android code
- ✅ Packages everything into APK
- ✅ Signs with debug or release key

**Build time:** ~5-10 minutes (first time), ~2-3 minutes (subsequent builds)

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### 3. Build AAB

```bash
cd android
./gradlew bundleRelease
```

**Output location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Build Variants

### Debug Build (for development):
```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

- Includes debugging tools
- Can inspect with Chrome DevTools
- Larger file size
- Not optimized

### Release Build (for production):
```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

- Optimized and minified
- Smaller file size
- Better performance
- Ready for distribution

---

## Signing the APK/AAB

For production, you need to sign your builds with a release keystore.

### 1. Generate Keystore (first time only):

```bash
cd android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore membershipauto-release.keystore \
  -alias membershipauto \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Enter when prompted:**
- Password (remember this!)
- Your name/organization details
- Confirm with "yes"

**⚠️ IMPORTANT:** 
- Backup this keystore file securely!
- Never commit it to git
- If you lose it, you can't update your app on Play Store

### 2. Configure Signing

Create `android/gradle.properties` (add these lines):

```properties
MEMBERSHIPAUTO_UPLOAD_STORE_FILE=membershipauto-release.keystore
MEMBERSHIPAUTO_UPLOAD_KEY_ALIAS=membershipauto
MEMBERSHIPAUTO_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MEMBERSHIPAUTO_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

Or export as environment variables:
```bash
export MEMBERSHIPAUTO_UPLOAD_STORE_FILE=membershipauto-release.keystore
export MEMBERSHIPAUTO_UPLOAD_KEY_ALIAS=membershipauto
export MEMBERSHIPAUTO_UPLOAD_STORE_PASSWORD=your_password
export MEMBERSHIPAUTO_UPLOAD_KEY_PASSWORD=your_password
```

### 3. Update build.gradle

Edit `android/app/build.gradle` and add signing config:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MEMBERSHIPAUTO_UPLOAD_STORE_FILE')) {
                storeFile file(MEMBERSHIPAUTO_UPLOAD_STORE_FILE)
                storePassword MEMBERSHIPAUTO_UPLOAD_STORE_PASSWORD
                keyAlias MEMBERSHIPAUTO_UPLOAD_KEY_ALIAS
                keyPassword MEMBERSHIPAUTO_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 4. Build Signed APK/AAB:

```bash
cd android
./gradlew assembleRelease  # For signed APK
./gradlew bundleRelease     # For signed AAB
```

---

## Clean Build (when things go wrong)

```bash
cd /home/binary/Desktop/membership-auto/mobile/android

# Clean all build artifacts
./gradlew clean

# Clean and rebuild
./gradlew clean assembleRelease
```

Or full clean:
```bash
cd /home/binary/Desktop/membership-auto/mobile

# Remove build folders
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

# Rebuild
cd android
./gradlew assembleRelease
```

---

## Testing the Builds

### Install APK on Device:

**Via ADB:**
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Via USB:**
1. Connect Android device
2. Enable USB debugging
3. Copy APK to device
4. Install from file manager

**Direct Download:**
1. Host APK on a server
2. Download on device
3. Enable "Install from Unknown Sources"
4. Install

### Test AAB:

AAB files can only be tested through Google Play:
1. Upload to Play Console
2. Use Internal Testing track
3. Download from Play Store

Or use `bundletool` to test locally:
```bash
# Install bundletool
npm install -g bundletool

# Generate APKs from AAB
bundletool build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks \
  --mode=universal

# Extract universal APK
unzip app.apks -d apks
adb install apks/universal.apk
```

---

## Build Optimization

### Reduce APK Size:

Edit `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Enable App Bundles (AAB):

AAB automatically optimizes for each device:
- Removes unused resources
- Splits by screen density
- Splits by architecture (arm, x86)

**Result:** Users download ~30% smaller APK

---

## Troubleshooting

### "SDK location not found"
```bash
# Create local.properties
echo "sdk.dir=/home/binary/Android/Sdk" > android/local.properties
```

Or:
```bash
export ANDROID_HOME=/home/binary/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### "Java version not compatible"
```bash
# Switch to Java 17
sudo update-alternatives --config java
# Select Java 17

# Verify
java -version
```

### "Gradle sync failed"
```bash
cd android
./gradlew --stop
./gradlew clean
./gradlew assembleRelease
```

### "Out of memory"
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### "Build failed with multiple errors"
```bash
# Full clean and rebuild
cd /home/binary/Desktop/membership-auto/mobile
npx expo prebuild --platform android --clean
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace
```

---

## Build Scripts (Convenient)

Create `build.sh` in mobile folder:

```bash
#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Building Membership Auto..."
echo ""

# Pre-build
echo "📦 Preparing native project..."
npx expo prebuild --platform android --clean

# Build APK
echo "🔨 Building release APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
    ls -lh app/build/outputs/apk/release/app-release.apk
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
```

Make executable:
```bash
chmod +x build.sh
```

Run:
```bash
./build.sh
```

---

## Quick Reference

```bash
# Build APK
cd android && ./gradlew assembleRelease

# Build AAB
cd android && ./gradlew bundleRelease

# Clean build
cd android && ./gradlew clean assembleRelease

# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Check build variants
cd android && ./gradlew tasks --all | grep assemble

# View APK info
cd android && ./gradlew assembleRelease --info
```

---

## Comparison: Local vs EAS Build

| Feature | Local (gradlew) | EAS Build |
|---------|----------------|-----------|
| Speed | ⚡ Fast (2-5 min) | 🐌 Slow (10-20 min) |
| Cost | 💰 Free | 💳 Limited free builds |
| Control | ✅ Full control | ❌ Limited control |
| Setup | 🔧 Requires Android SDK | ✨ No setup needed |
| Signing | 🔑 Manual | 🔑 Automatic |
| Best for | Development & testing | Production releases |

**Recommendation:** Use local builds for development and testing, EAS for production releases.

---

**You're ready to build!** Run `cd android && ./gradlew assembleRelease` to create your first APK! 🚀
