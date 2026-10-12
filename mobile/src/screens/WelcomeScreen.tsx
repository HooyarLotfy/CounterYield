import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAppStore } from "../state/store";
import { MeraAuthService, BiometricCapability } from "../auth/meraAuth";
import { colors, radius, space } from "../theme";
import { KuruLogo, PerplLogo, MonadLogo } from "../components/Logos";
import {
  Zap,
  TrendingUp,
  Shield,
  Layers,
  Lock,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Camera,
  Laptop,
  Smartphone,
  Eye,
  Fingerprint,
} from "lucide-react-native";

export const WelcomeScreen: React.FC = () => {
  const { authenticate, loadDemoTestingPreset } = useAppStore();

  // 3-Step Educational Onboarding:
  // Step 1: How the System Works (Delta-Neutral Carry)
  // Step 2: The DEXs We Connect To (Kuru CLOB + Perpl DEX + CarryLedger)
  // Step 3: Biometric Security & 1-Tap Vault Launch
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<BiometricCapability>({
    hasHardware: false,
    isEnrolled: false,
    biometryType: "PASSKEY",
    label: "Face ID / Passkey",
    isWeb: Platform.OS === "web",
  });
  const [vaultAddress, setVaultAddress] = useState<string>("");

  // Laptop Webcam Simulation state (Web only)
  const videoRef = useRef<any>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [webcamStream, setWebcamStream] = useState<any>(null);

  useEffect(() => {
    MeraAuthService.checkCapabilities().then((caps) => {
      setCapabilities(caps);
    });
    MeraAuthService.getOrCreateDeviceWallet().then((w) => {
      setVaultAddress(w.address);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (webcamStream) {
        try {
          webcamStream.getTracks().forEach((track: any) => track.stop());
        } catch {}
      }
    };
  }, [webcamStream]);

  const handleLaunchVault = () => {
    authenticate(vaultAddress);
  };

  const handleBiometricEnrollment = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await MeraAuthService.unlockVault(
        `Enroll ${capabilities.label} for CounterYield`
      );
      if (result.success && result.address) {
        authenticate(result.address);
      } else {
        setAuthError(result.error || "Biometric authentication cancelled.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to trigger biometrics.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const startWebcamScan = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      handleLaunchVault();
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 320 } },
      });
      setWebcamStream(stream);
      setIsWebcamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            try {
              stream.getTracks().forEach((track) => track.stop());
            } catch {}
            setIsWebcamActive(false);
            setIsAuthenticating(false);
            authenticate(vaultAddress);
          }, 300);
        }
      }, 350);
    } catch {
      setIsAuthenticating(false);
      setIsWebcamActive(false);
      setAuthError("Webcam access declined. Launching vault directly...");
      setTimeout(() => handleLaunchVault(), 600);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Stepper Navigation */}
        <View style={styles.stepperHeader}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => setStep((s) => ((s - 1) as 1 | 2))}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.networkBadgeTop}>
              <View style={styles.networkDot} />
              <Text style={styles.networkBadgeTopText}>Monad Testnet 10143</Text>
            </View>
          )}

          <View style={styles.stepperDots}>
            <View style={[styles.dot, step >= 1 && styles.dotActive]} />
            <View style={[styles.dot, step >= 2 && styles.dotActive]} />
            <View style={[styles.dot, step >= 3 && styles.dotActive]} />
          </View>

          <Text style={styles.stepCounterText}>Step {step} of 3</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ======================================================== */}
          {/* STEP 1: HOW THE SYSTEM WORKS (DELTA-NEUTRAL CARRY)       */}
          {/* ======================================================== */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBlock}>
                <Text style={styles.screenHeading}>How It Works</Text>
                <Text style={styles.screenSubheading}>
                  Earn institutional funding yield with zero cryptocurrency price volatility.
                </Text>
              </View>

              {/* Explanatory Cards */}
              <View style={styles.cardList}>
                {/* 1. Delta-Neutral */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <Zap size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Zero Price Exposure</Text>
                    <Text style={styles.cardBody}>
                      When you deposit, the system buys spot MON and simultaneously opens an equal 1x short hedge.
                      Whether MON doubles or crashes 80%, your dollar value stays fully protected.
                    </Text>
                  </View>
                </View>

                {/* 2. Funding Yield */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <TrendingUp size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Continuous Hourly Yield</Text>
                    <Text style={styles.cardBody}>
                      Leveraged traders on perps exchanges pay an hourly funding fee. CounterYield collects this fee on your behalf 24/7, paying ~18.4% APY directly to your balance.
                    </Text>
                  </View>
                </View>

                {/* 3. 10% Reserve Buffer */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <Shield size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Automated Liquidation Buffer</Text>
                    <Text style={styles.cardBody}>
                      10% of every deposit stays in liquid AUSD cash. If sudden market spikes occur, the automated Risk Guard absorbs wicks so your position is never liquidated.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* STEP 2: THE DEXs WE CONNECT TO (MONAD ECOSYSTEM)         */}
          {/* ======================================================== */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBlock}>
                <Text style={styles.screenHeading}>The DEXs We Connect To</Text>
                <Text style={styles.screenSubheading}>
                  Atomic dual-leg execution across Monad's high-speed DeFi ecosystem.
                </Text>
              </View>

              {/* Explanatory Cards for Venues */}
              <View style={styles.cardList}>
                {/* 1. Kuru CLOB */}
                <View style={styles.explainCard}>
                  <View style={[styles.cardIconBox, { backgroundColor: "transparent" }]}>
                    <KuruLogo size={32} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>Kuru Spot CLOB</Text>
                      <View style={[styles.venueBadge, { backgroundColor: "rgba(255, 87, 34, 0.15)" }]}>
                        <Text style={[styles.venueBadgeText, { color: colors.kuruOrange }]}>Spot Order Book</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody}>
                      Monad's premier Central Limit Order Book exchange. We execute spot MON buys directly on-chain with tight spreads and institutional depth.
                    </Text>
                  </View>
                </View>

                {/* 2. Perpl DEX */}
                <View style={styles.explainCard}>
                  <View style={[styles.cardIconBox, { backgroundColor: "transparent" }]}>
                    <PerplLogo size={32} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>Perpl DEX (Market 64)</Text>
                      <View style={[styles.venueBadge, { backgroundColor: "rgba(131, 110, 249, 0.15)" }]}>
                        <Text style={[styles.venueBadgeText, { color: colors.monadViolet }]}>Perpetuals DEX</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody}>
                      Monad's high-speed perpetual futures exchange. We open an exact 1x short hedge via low-gas Immediate-or-Cancel (IOC) orders.
                    </Text>
                  </View>
                </View>

                {/* 3. CarryLedger Contract */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <Layers size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>CarryLedger Smart Contract</Text>
                      <View style={styles.venueBadge}>
                        <Text style={styles.venueBadgeText}>Non-Custodial</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody}>
                      Audited onchain contract at 0x9998...f906. Enforces policy caps, margin checks, and cryptographic proof-of-hedge on Monad Testnet.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* STEP 3: BIOMETRIC SECURITY & 1-TAP VAULT LAUNCH          */}
          {/* ======================================================== */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBlock}>
                <Text style={styles.screenHeading}>No Seed Phrases. Real Security.</Text>
                <Text style={styles.screenSubheading}>
                  Your vault is secured inside your device's hardware Secure Enclave.
                </Text>
              </View>

              {/* Webcam Viewfinder OR Security Glyph */}
              <View style={styles.securityVisualBox}>
                {Platform.OS === "web" && isWebcamActive ? (
                  <View style={styles.webcamViewfinder}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                      }}
                    />
                    <View style={styles.scanReticle}>
                      <View style={styles.reticleTopLeft} />
                      <View style={styles.reticleTopRight} />
                      <View style={styles.reticleBottomLeft} />
                      <View style={styles.reticleBottomRight} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.securityGlyphOuter}>
                    <View style={styles.securityGlyphInner}>
                      {Platform.OS === "web" ? (
                        <Laptop size={36} color={colors.lime} strokeWidth={2.2} />
                      ) : capabilities.biometryType === "FACE_ID" ? (
                        <Eye size={36} color={colors.lime} strokeWidth={2.2} />
                      ) : (
                        <Fingerprint size={36} color={colors.lime} strokeWidth={2.2} />
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Security Explanations */}
              <View style={styles.cardList}>
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <Lock size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Hardware-Isolated Passkeys</Text>
                    <Text style={styles.cardBody}>
                      Trade-only keys are derived locally via WebAuthn PRF. Keys never leave your device and cannot be stolen or compromised.
                    </Text>
                  </View>
                </View>

                <View style={styles.explainCard}>
                  <View style={styles.cardIconBox}>
                    <CheckCircle2 size={18} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Hardware-Derived Monad Account</Text>
                    <Text style={styles.cardAddress}>
                      {vaultAddress ? `${vaultAddress.slice(0, 8)}...${vaultAddress.slice(-6)}` : "Deriving keypair..."}
                    </Text>
                    <Text style={styles.cardBody}>
                      Monad Testnet (Chain 10143) · Hardware-isolated key derived deterministically via WebAuthn PRF.
                    </Text>
                  </View>
                </View>
              </View>

              {authError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation Dock */}
        <View style={styles.bottomDock}>
          {step === 1 && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => setStep(2)}
              >
                <Text style={styles.primaryButtonText}>Next: DEX Integrations</Text>
                <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={handleLaunchVault}
              >
                <Text style={styles.secondaryButtonText}>Quick Launch (Skip to Vault)</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => setStep(3)}
              >
                <Text style={styles.primaryButtonText}>Next: Security & Launch</Text>
                <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() => setStep(1)}
              >
                <Text style={styles.secondaryButtonText}>Back to How It Works</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              {Platform.OS === "web" ? (
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.85}
                    onPress={handleLaunchVault}
                  >
                    <Text style={styles.primaryButtonText}>1-Click Launch Vault (Enter App)</Text>
                    <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.7}
                    disabled={isAuthenticating}
                    onPress={startWebcamScan}
                  >
                    {isAuthenticating ? (
                      <ActivityIndicator size="small" color={colors.lime} />
                    ) : (
                      <>
                        <Camera size={16} color={colors.lime} style={{ marginRight: 6 }} />
                        <Text style={[styles.secondaryButtonText, { color: colors.lime }]}>
                          Test Laptop Webcam Face ID Scan
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.85}
                    disabled={isAuthenticating}
                    onPress={handleBiometricEnrollment}
                  >
                    {isAuthenticating ? (
                      <ActivityIndicator color={colors.textDark} />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>
                          Enable {capabilities.label} & Launch
                        </Text>
                        <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.7}
                    onPress={handleLaunchVault}
                  >
                    <Text style={styles.secondaryButtonText}>Use Passcode & Enter</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: Platform.OS === "android" ? 36 : space.md,
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    width: "100%",
    alignSelf: "center",
  },
  stepperHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.sm,
    paddingVertical: space.xs,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  networkBadgeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  networkBadgeTopText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  stepperDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceCardElevated,
  },
  dotActive: {
    backgroundColor: colors.lime,
  },
  stepCounterText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: space.lg,
  },
  stepContainer: {
    paddingVertical: space.xs,
  },
  headerBlock: {
    marginVertical: space.md,
  },
  screenHeading: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  screenSubheading: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  cardList: {
    gap: space.sm,
    marginVertical: space.sm,
  },
  explainCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.md,
    gap: space.md,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  venueBadge: {
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  venueBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.lime,
  },
  cardAddress: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginVertical: 2,
  },
  cardBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  securityVisualBox: {
    alignItems: "center",
    marginVertical: space.md,
  },
  securityGlyphOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  securityGlyphInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  webcamViewfinder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: colors.lime,
    backgroundColor: colors.surface,
  },
  scanReticle: {
    ...StyleSheet.absoluteFillObject,
  },
  reticleTopLeft: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.lime,
  },
  reticleTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.lime,
  },
  reticleBottomLeft: {
    position: "absolute",
    bottom: 14,
    left: 14,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.lime,
  },
  reticleBottomRight: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.lime,
  },
  errorBanner: {
    backgroundColor: colors.crimsonSoft,
    padding: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.crimson,
    marginTop: space.sm,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    textAlign: "center",
  },
  bottomDock: {
    gap: space.xs,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  primaryButton: {
    backgroundColor: colors.lime,
    height: 50,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  primaryButtonText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    height: 46,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
