# Release Checklist - Kabadiyo

**Date:** 2025-12-31
**Version:** 1.0.0

---

## ✅ Code Quality
- [x] TypeScript check passed (`tsc --noEmit`)
- [x] Build successful (`npm run build`)
- [x] No critical ESLint errors
- [x] Security fixes applied (Cleartext disabled, HTTPS enforced)

## ✅ Bug Fixes Applied
- [x] Referral System fixed (Unified stored vs derived codes)
- [x] Clear Chat functionality fixed (ID mismatch resolved)
- [x] Loading state added (blank screen prevention)
- [x] **Rates Page**: Created missing `/rates` page for live scrap pricing
- [x] **Stories API**: Fixed 500 internal server error in grouping logic
- [x] **Build**: Verified 100% successful production build (84 static pages)

## ✅ Security & Compliance
- [x] `network_security_config.xml` - HTTPS enforcement
- [x] `cleartext: false` in Capacitor config
- [x] `android:allowBackup="false"` in AndroidManifest
- [x] Privacy Policy present (`/privacy-policy`)
- [x] Delete Account feature present (`/settings`)
- [x] PermissionGuard component for runtime permissions

## ✅ PWA Configuration
- [x] `manifest.json` enhanced with all icon sizes
- [x] `sw.js` Service Worker with offline support
- [x] App shortcuts configured
- [x] TWA instructions in `TWA_SETUP.md`

## ✅ CI/CD
- [x] GitHub Actions workflow (`.github/workflows/ci.yml`)
- [x] Lighthouse CI configuration (`lighthouserc.json`)

## ⚠️ Pending / Optional
- [ ] Generate all icon sizes (72, 96, 128, 144, 152, 384) if not existing
- [ ] Add more unit tests (currently no test files detected)
- [ ] Run Lighthouse and optimize for >= 90 score
- [ ] Create `.well-known/assetlinks.json` on server for TWA

---

## 📦 Build Commands
```bash
# Install dependencies
npm ci

# Build production
npm run build

# Start production server
npm start

# Build Android APK (Capacitor)
npx cap sync android
cd android && ./gradlew assembleRelease
```

## 🚀 Play Store Submission Steps
1. Build production APK/AAB
2. Upload to Google Play Console
3. Fill in store listing (screenshots, description)
4. Complete Data Safety form (see walkthrough.md)
5. Submit for review

## 📁 Key Files Modified
- `capacitor.config.ts` - Disabled cleartext
- `android/app/src/main/AndroidManifest.xml` - Security hardening
- `android/app/src/main/res/xml/network_security_config.xml` - NEW
- `src/components/secure/PermissionGuard.tsx` - NEW
- `src/app/loading.tsx` - NEW
- `src/app/api/referral/route.ts` - Fixed logic
- `src/app/api/chat/clear/[conversationId]/route.ts` - Fixed logic
- `src/lib/geo.ts` - HTTPS upgrade
- `public/manifest.json` - Enhanced for TWA
- `public/logo.png` - New mascot logo
