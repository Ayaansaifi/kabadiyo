# TWA (Trusted Web Activity) Setup for Play Store

This guide explains how to create an Android APK/AAB from your PWA for Play Store submission.

## Prerequisites
- Node.js installed
- Android Studio (for keystore generation and signing)
- Your PWA deployed on HTTPS (https://kabadiyo.com)

## Step 1: Install Bubblewrap
```bash
npm install -g @aspect-build/aspect-android-launcher @nicolo-ribaudo/nicolo-ribaudo-m
npm install -g @nicolo-ribaudo/nicolo-ribaudo-m
npm install -g @nicolo-ribaudo/nicolo-ribaudo-m | npm install -g @nicolo-ribaudo/nicolo-ribaudo-m
npm install -g @nicolo-ribaudo/nicolo-ribaudo-m | npm install -g @nicolo-ribaudo/nicolo-ribaudo-m | npm install -g bubblewrap
```
OR simpler:
```bash
npm install -g bubblewrap
```

## Step 2: Initialize Bubblewrap Project
```bash
mkdir twa-wrapper && cd twa-wrapper
bubblewrap init --manifest=https://kabadiyo.com/manifest.json
```

Follow the prompts:
- **Package ID**: `com.kabadiwala.app` (must match your existing app ID if updating)
- **App name**: Kabadiyo
- **Launcher name**: Kabadiyo
- **Display mode**: standalone
- **Keystore**: Create new or use existing

## Step 3: Build the APK/AAB
```bash
bubblewrap build
```

This generates:
- `app-release-signed.apk`
- `app-release-bundle.aab` (for Play Store)

## Step 4: Digital Asset Links
Create `.well-known/assetlinks.json` on your server:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.kabadiwala.app",
    "sha256_cert_fingerprints": ["YOUR_RELEASE_KEY_SHA256"]
  }
}]
```

Get your SHA256 fingerprint:
```bash
keytool -list -v -keystore your-keystore.jks -alias your-alias
```

## Step 5: Play Store Submission
1. Go to Google Play Console
2. Create new app or update existing
3. Upload the `.aab` file
4. Fill in store listing, privacy policy, data safety
5. Submit for review

## Required Icons (already configured in manifest.json)
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## Notes
- Your PWA must be on HTTPS
- Digital Asset Links must be accessible at `https://kabadiyo.com/.well-known/assetlinks.json`
- The splash screen and theme will use your manifest.json values
