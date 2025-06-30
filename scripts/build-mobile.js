const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Building NetFrix Mobile App...")

// Step 1: Build Next.js app for static export
console.log("📦 Building Next.js app...")
execSync("npm run build", { stdio: "inherit" })

// Step 2: Initialize Capacitor if not already done
if (!fs.existsSync("capacitor.config.ts")) {
  console.log("⚡ Initializing Capacitor...")
  execSync("npx cap init", { stdio: "inherit" })
}

// Step 3: Add platforms if not already added
const androidPath = path.join(process.cwd(), "android")
const iosPath = path.join(process.cwd(), "ios")

if (!fs.existsSync(androidPath)) {
  console.log("🤖 Adding Android platform...")
  execSync("npx cap add android", { stdio: "inherit" })
}

if (!fs.existsSync(iosPath)) {
  console.log("🍎 Adding iOS platform...")
  execSync("npx cap add ios", { stdio: "inherit" })
}

// Step 4: Copy web assets to native projects
console.log("📱 Syncing with native projects...")
execSync("npx cap sync", { stdio: "inherit" })

// Step 5: Generate app icons and splash screens
console.log("🎨 Generating app icons and splash screens...")
try {
  execSync("npx capacitor-assets generate", { stdio: "inherit" })
} catch (error) {
  console.log("⚠️  Install @capacitor/assets for automatic icon generation")
  console.log("npm install -D @capacitor/assets")
}

// Step 6: Build Android APK
console.log("🔨 Building Android APK...")
try {
  execSync("cd android && ./gradlew assembleDebug", { stdio: "inherit" })
  console.log("✅ Android APK built successfully!")
  console.log("📍 APK location: android/app/build/outputs/apk/debug/app-debug.apk")
} catch (error) {
  console.log("❌ Android build failed. Make sure Android Studio and SDK are installed.")
}

console.log("🎉 Mobile app build process completed!")
console.log("\n📋 Next steps:")
console.log("1. Test the APK on your device")
console.log("2. For production: ./gradlew assembleRelease")
console.log("3. For iOS: Open ios/App/App.xcworkspace in Xcode")
