# Android Studio Build Guide - Kabadiyo

Agar aap pehli baar Android Studio se app bana rahe hain, toh ye bilkul suru se steps hain:

### 1. Project Sync (Zaroori Step)
Sabse pehle aapko apne Next.js code ko Android folder ke saath sync karna hoga. Terminal mein ye command chalayein:
```powershell
# Production build banayein
npm run build

# Android project ko sync karein
npx cap sync android
```

---

### 2. Android Studio mein Open Karein
1. **Android Studio** open karein.
2. `Open` par click karein.
3. Apne project folder (`kabadiwala`) ke andar jaakar **`android`** folder ko select karein aur `OK` dabayein.
4. Niche right side mein "Gradle sync" complete hone ka wait karein (isme 2-5 mins lag sakte hain).

---

### 3. App Logo Set Karein (Mascot v2)
Maine icons sync kar diye hain, par final launcher icon ke liye:
1. Niche `app` (folder structure mein) par **Right-click** karein.
2. **New > Image Asset** par jayein.
3. `Path` ke samne folder icon par click karke ye file select karein: `e:\edrivekabadi\kabadiwala\public\logo.png`
4. **Scaling**: Agar logo kat raha hai toh `Resize` slider se use chota (70-80%) karein.
5. `Next` dabayein fir `Finish`.

---

### 4. Build Generate Karein (APK ya AAB)
Play Store ke liye **AAB** zaroori hai, testing ke liye **APK**.

1. Top menu mein jayein: **Build > Generate Signed Bundle / APK...**
2. **Android App Bundle** (AAB) select karein aur `Next` dabayein.
3. **Key Store Path**:
   - Agar aap first time kar rahe hain, toh Click **`Create new...`**
   - Ek file name aur password set karein (jaise `kabadiyo-key.jks`).
   - Alias mein `kabadi-alias` likhein aur password dobara dalein.
   - Apni details (Name, Org) bhar kar **OK** karein.
   - **Important**: Ye password aur file sambhal kar rakhein, iske bina app update nahi hoga!
4. `Next` dabayein.
5. **Build Variant**: `release` ko select karein.
6. `Finish` par click karein.

---

### 5. File Download Karein
Wait karein jab tak niche pop-up na aaye: *"Generate Signed Bundle: bundle(s) generated successfully."*
- `Locate` button dabayein.
- Aapki file `app-release.aab` tayyar hai! 

---

### 📦 Quick Tips:
- **Testing**: Agar mobile par install karke check karna hai, toh Bundle ki jagah **APK** select karein Step 4 mein.
- **Errors**: Agar Gradle error aaye, toh click karein `File > Invalidate Caches... > Invalidate and Restart`.
