# Implementation Plan: Mobile Polish, Status Bar Fix, Icon Update & Android Navigation

## 1. Current State Analysis & Identified Flaws

### Flaw 1: Status Bar Overlap (Top Body Content Collision)
- **Current Behavior**: The top area of the application renders directly under the Android notification bar and status bar clock/battery/wifi icons.
- **Root Cause**: `mobile/android/app/src/main/res/values/styles.xml` sets `<item name="android:statusBarColor">@android:color/transparent</item>`, forcing edge-to-edge drawing. Standard React Native `SafeAreaView` only handles iOS home indicators and notches—on Android, it produces `0` padding by default. `App.tsx` lacks `paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0`.
- **Target Fix**: Set `android:statusBarColor` to `#0D0E11` in `styles.xml`, set `translucent={false}` on `StatusBar` in `App.tsx`, and ensure safe top spacing so top navigation/header never collides with status bar indicators.

### Flaw 2: Check Updates Button Layout Collision in Settings
- **Current Behavior**: In `SettingsScreen.tsx`, `versionCardHeader` aligns version information and `checkUpdateBtn` horizontally. On typical mobile screen widths, the button overflows horizontally and gets truncated. Furthermore, the bottom spacer is only `60px`, leaving the card partially hidden underneath the persistent bottom navigation bar.
- **Target Fix**: Redesign `versionCard` into a clean vertical stack with version metadata on top, a full-width "Check for Updates" button below, and increase bottom scroll padding to `130px`.

### Flaw 3: White Background / Gray Icon Flash & Launch Intro Modal Flash
- **Part A (White Flash / Gray Icon)**:
  - **Root Cause**: `mobile/android/app/src/main/res/values/colors.xml` sets `<color name="splashscreen_background">#FFFFFF</color>`. `AppTheme` in `styles.xml` does not set `android:windowBackground`, defaulting to white during Android Activity draw cycles and tab toggles (`display: 'none'` to `'flex'`).
  - **Target Fix**: Set `splashscreen_background` to `#0D0E11`, add `<item name="android:windowBackground">#0D0E11</item>` to `AppTheme`, and ensure seamless dark backgrounds across all tab wrappers.
- **Part B (Intro Modal Flash on Launch)**:
  - **Root Cause**: In `App.tsx`, `hasOnboarded` initializes as `null`. The unauthenticated render condition `hasOnboarded ? <UnlockScreen /> : <WelcomeScreen />` treats `null` as falsy, rendering `<WelcomeScreen />` for ~200-500ms while `MeraAuthService.hasCompletedOnboarding()` reads storage, before suddenly swapping to `<UnlockScreen />`.
  - **Target Fix**: If `hasOnboarded === null`, render an intentional dark loader view (`<View style={{ flex: 1, backgroundColor: colors.bg }} />`), preventing `<WelcomeScreen />` from ever flashing for existing wallet holders.

### Flaw 4: Outdated Android Launcher Icon
- **Current Behavior**: The launcher icon outside the app uses default boilerplate assets.
- **Target Fix**: Rasterize `E:\CounterYield Landing Page\public\images\logo-counteryield-2.5d.svg` (copied to `mobile/assets/logo-counteryield-2.5d.svg`) via Microsoft Edge headless high-DPI rendering and PIL Lanczos downsampling into all Android mipmap densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) for both square and round adaptive icons.

### Flaw 5: Android Hardware Back Button Exits App Unconditionally
- **Current Behavior**: Tapping Android's back button or using the back swipe gesture terminates the application immediately from any tab or modal.
- **Target Fix**: Wire `BackHandler` in `App.tsx`:
  - If `isRiskGuardModalOpen`: close modal (`openRiskGuardModal(false)`).
  - Else if `activeTab !== 'home'`: return to `'home'`.
  - Else: allow default system exit.

### Flaw 6: Biometric Button Copy ("Face ID" Hardcoded)
- **Current Behavior**: `UnlockScreen.tsx` displays "Unlock with Touch ID / Face ID" or device-dependent labels that look out of place on Android.
- **Target Fix**: Simplify the primary action button copy to **"Enter App"** (or **"Enter"**), keeping biometric hardware detection seamless in the background.

### Flaw 7: Wordy & Over-Technical UI Copy
- **Current Behavior**: Technical parameters like "Dual-Leg Slippage Tolerance 50 bps (0.50%)\nMaximum execution variance across Kuru spot and ...", "Annualized Funding Floor", and lengthy enclave descriptions wrap awkwardly and truncate into "y...".
- **Target Fix**: Replace with clean, human-readable microcopy inspired by Uniswap and Phantom (e.g., "Slippage Tolerance", "Min Funding Rate", "Leverage Cap", "Safety Reserve", "Backup Secret Keys", "Save Settings").

---

## 2. Tech Stack & Architecture Overview
- **Mobile Runtime**: React Native 0.86, Expo 57, Hermes Engine, Reanimated 4, Lucide Icons.
- **Native Android**: SDK 34/36, Gradle 9.3, Java 17.
- **Backend & Relayer**: Node.js/Express on VPS port `48392`, PM2 daemon.

---

## 3. Step-by-Step Implementation Plan

### Step 1: Android Status Bar & Native Window Theme
- Modify `mobile/android/app/src/main/res/values/styles.xml`:
  - Set `android:statusBarColor` to `#0D0E11`.
  - Set `android:windowBackground` to `#0D0E11`.
- Modify `mobile/android/app/src/main/res/values/colors.xml`:
  - Change `splashscreen_background` to `#0D0E11`.
- In `mobile/App.tsx`:
  - Configure `<StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />`.
  - Add safe top padding to `appContainer`: `paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0`.

### Step 2: Prevent Splash/Modal Race Condition on Launch
- In `mobile/App.tsx`:
  - Check `if (hasOnboarded === null)`: return a dark initializing view.
  - Only show `<WelcomeScreen />` when `hasOnboarded === false`.
  - Only show `<UnlockScreen />` when `hasOnboarded === true && !isAuthenticated`.

### Step 3: Implement Android Hardware Back Navigation
- In `mobile/App.tsx`:
  - Add `BackHandler.addEventListener('hardwareBackPress', ...)` handling modal closing and tab unwinding to Home.

### Step 4: Redesign Settings Layout & Update Button
- In `mobile/src/screens/SettingsScreen.tsx`:
  - Restructure `versionCard` with vertical stacking so "Check for Updates" is never compressed or truncated.
  - Set `contentContainerStyle` with `paddingBottom: 130` so the card sits comfortably above `BottomTabBar`.

### Step 5: Update UnlockScreen Button Copy
- In `mobile/src/screens/UnlockScreen.tsx`:
  - Change button label to `"Enter App"`.

### Step 6: Simplify & Shorten Copy Across Screens
- Update `SettingsScreen.tsx`:
  - "Slippage Tolerance", "Min Funding Rate", "Leverage Cap", "Safety Reserve", "Backup Secret Keys", "Save Settings".
- Verify `HomeScreen.tsx`, `PortfolioScreen.tsx`, `StartEarningScreen.tsx` for clean, un-truncated labels.

### Step 7: Generate & Install Android 2.5D Launcher Icons
- Run Python script using headless Microsoft Edge to render `mobile/assets/logo-counteryield-2.5d.svg` into high-resolution PNG, then export to:
  - `mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
  - `mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
  - `mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
  - `mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
  - `mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
  - Matching `ic_launcher_round.png` versions.

### Step 8: Rebuild & Deploy APK on VPS Pipeline
- Sync updated files to VPS at `/root/build-counteryield-apk/mobile/`.
- Run Gradle `assembleRelease` to produce updated `counteryield-v1.0.0.apk`.
- Copy to `/var/www/counteryield-backend/public/downloads/`.
- Verify public download endpoint with HTTP 200.

---

## 4. Data Flow & State Impact
- Zero breaking changes to onchain contracts, wallet encryption, or telemetry WebSockets.
- Pure presentation and native lifecycle improvements.

---

## 5. Constraints & Assumptions
- All native builds executed on VPS (10GB RAM) to avoid host machine pagefile memory limits.
- Standalone Native React Native app maintained (Zero WebViews).
