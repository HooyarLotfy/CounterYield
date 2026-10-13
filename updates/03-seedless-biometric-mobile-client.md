# Update 3: Seedless Biometric Mobile Client and Live Telemetry Architecture

## Overview

CounterYield delivers a consumer mobile experience for delta-neutral yield on Monad, removing seed phrases and wallet popups through hardware-level biometric authentication.

## The Problem

Most decentralized finance applications require browser extensions, seed phrase backups, and transaction confirmations with raw hex data. This friction limits participation to experienced crypto traders.

## Technical Implementation

We built a mobile application using Expo React Native supporting iOS, Android, and Web:

1. **Hardware Biometric Key Derivation**:
   - Integrates WebAuthn PRF with device Secure Enclaves (Face ID on iOS, BiometricPrompt on Android, and WebAuthn/webcam simulation on Web).
   - Generates a unique 256-bit seed per device, deriving a dedicated Monad EVM wallet address deterministically.
   - Encrypts session signing keys at rest using AES-256-GCM via the Web Crypto API (`crypto.subtle`), held in volatile memory only during active sessions.
   - Persists encrypted credentials safely via `expo-secure-store` on native platforms and `localStorage` on web.

2. **Real-Time Data Feeds**:
   - Fetches live ERC-20 AUSD balances directly from Monad Testnet RPC via `eth_call`.
   - Connects to an active WebSocket telemetry stream (`ws/telemetry`) with automatic exponential backoff reconnection.
   - Displays live Kuru CLOB orderbook depth, bid/ask spreads, and Monad testnet block numbers.

3. **Uniswap Spore-Grade Interface**:
   - Designed around a matte charcoal palette (`#131313`, `#1F1F1F`) with calibrated non-neon lime accents (`#9FE825`).
   - Features custom vector logo marks for Kuru, Perpl, Monad, and Agora.
   - Structured into a 3-step educational onboarding flow explaining the strategy, venue mechanics, and device security.

## Relevant Files and Folders in the Repository

The mobile client, authentication vault, and telemetry hooks are organized into dedicated subdirectories within the mobile package:

- `mobile/src/auth/meraAuth.ts`: Device biometric capability detection, operating system authentication prompt triggers, and deterministic wallet address derivation.
- `mobile/src/auth/prfVault.ts`: Hardware-isolated credential vault using Web Crypto API (`crypto.subtle`) for authenticated AES-256-GCM encryption.
- `mobile/src/components/Logos.tsx`: Precision SVG vector logos for Kuru CLOB, Perpl DEX, Monad (MON), and Agora (AUSD).
- `mobile/src/screens/WelcomeScreen.tsx`: 3-step educational onboarding explaining delta-neutral mechanics, connected DEX venues, and biometric setup.
- `mobile/src/screens/HomeScreen.tsx`: Core portfolio view displaying net delta, live funding APY, and real-time WebSocket connection state.
- `mobile/src/screens/StartEarningScreen.tsx`: Single-tap deposit form with preset chips, automated capital sizing breakdown, and break-even estimations.
- `mobile/src/screens/SpotScreen.tsx`: Standalone orderbook depth viewer for Kuru MON/AUSD market displaying real-time bids and asks.
- `mobile/src/screens/ActivityScreen.tsx`: Auditable transaction feed linking verified on-chain executions to the Monadscan explorer.
- `mobile/src/services/useTelemetry.ts`: WebSocket client hook managing live subscription state and reconnection logic.
- `mobile/src/state/store.ts`: Central Zustand application store managing user authentication and Monad RPC balance queries.
- `mobile/src/theme.ts`: Design system tokens establishing Spore dark matte charcoal surfaces, spacing scales, and typography hierarchies.

## Outcome

Users can open the app, authenticate with Face ID in two seconds, deposit AUSD, and monitor their position in real time with zero seed phrases or browser extension setup.
