# Update 3: Seedless Biometric Mobile Client and Live Telemetry Architecture

## What this update does

This update gives CounterYield a simple mobile app where you log in with your face or fingerprint, with zero seed phrases and real-time live data from Monad.

## The Problem

Most crypto apps are annoying to use:
- You have to write down 12 random words on paper and hope you do not lose them.
- You have to install browser wallet extensions and approve confusing popups with raw computer code.
- If you lose your paper backup, your money is gone forever.

CounterYield works like Apple Pay or your regular banking app: you use your face, fingerprint, or device passcode.

## How the mobile wallet works

1. **Your phone creates your keys**:
   - The app asks your phone's built-in security chip (Secure Enclave) to create your wallet keys using WebAuthn PRF.
   - You unlock your account with Face ID on iPhone, fingerprint on Android, or your device passcode on a laptop.

2. **Keys stay on your device**:
   - The keys are encrypted with AES-256-GCM and stored only inside your phone's secure memory (`expo-secure-store` on phones, `localStorage` on web).
   - They are never sent to any server or shared with anyone.

3. **No seed phrases**:
   - You never have to write down or store 12 secret words. Your phone hardware holds the keys safely.

## Live real-time connection to Monad

The app does not use fake or simulated numbers:
- **Real AUSD balance**: Queries your real balance directly from Monad testnet using an RPC call on every login.
- **Live price stream**: A WebSocket connection streams live mark prices, safety margin levels, and accrued funding earnings to your screen every second.
- **Live Kuru orderbook**: A dedicated Spot screen lets you see the actual bids and asks on Kuru's Monad orderbook.
- **Clear vector logos**: Custom, clean logos for Kuru, Perpl, Monad, and AUSD so you always know which exchange holds each part of your trade.

## Relevant files and folders in the repository

- `mobile/src/auth/meraAuth.ts`: Checks what biometrics your device supports and creates your unique wallet address.
- `mobile/src/auth/prfVault.ts`: Uses your device's security chip to encrypt your trading keys with AES-256-GCM.
- `mobile/src/components/Logos.tsx`: Clean vector logo drawings for Kuru, Perpl, Monad, and Agora.
- `mobile/src/screens/WelcomeScreen.tsx`: 3-step setup explaining how the trade works, which exchanges we use, and biometric login.
- `mobile/src/screens/HomeScreen.tsx`: Main dashboard showing your balance, live funding yield, and both sides of your trade.
- `mobile/src/screens/StartEarningScreen.tsx`: 1-tap deposit screen that lets you pick an amount and open your position.
- `mobile/src/screens/SpotScreen.tsx`: Live orderbook viewer showing buy and sell orders on Kuru.
- `mobile/src/screens/ActivityScreen.tsx`: List of your past trades with clickable links to check them on the Monad block explorer.
- `mobile/src/services/useTelemetry.ts`: WebSocket helper that stays connected to the live price feed and reconnects automatically if dropped.
- `mobile/src/state/store.ts`: The central memory of the app that stores your balance, active trade, and login state.
- `mobile/src/theme.ts`: Color palette using dark charcoal (`#131313`) and clean lime green (`#9FE825`).
