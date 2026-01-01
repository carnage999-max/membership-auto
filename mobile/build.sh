#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Building Membership Auto Android App..."
echo ""

# Check if android folder exists
if [ ! -d "android" ]; then
    echo "📦 Android project not found. Running prebuild..."
    npx expo prebuild --platform android --clean
fi

# Build APK
echo "🔨 Building release APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📁 APK location:"
    ls -lh app/build/outputs/apk/release/app-release.apk
    echo ""
    echo "📦 To install on device:"
    echo "   adb install app/build/outputs/apk/release/app-release.apk"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
