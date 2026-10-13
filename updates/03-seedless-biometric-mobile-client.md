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

## Outcome

Users can open the app, authenticate with Face ID in two seconds, deposit AUSD, and monitor their position in real time with zero seed phrases or browser extension setup.
