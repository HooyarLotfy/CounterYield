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
  Image,
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
  const { authenticate } = useAppStore();

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
    <View style={styles.safeArea}>
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
                  Dollar yield. No price bets.
                </Text>
              </View>

              {/* Explanatory Cards */}
              <View style={styles.cardList}>
                {/* 1. Delta-Neutral */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <Zap size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Zero Price Exposure</Text>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Long spot + equal short. Price moves cancel out.
                    </Text>
                  </View>
                </View>

                {/* 2. Funding Yield */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <TrendingUp size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Funding Yield</Text>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Perp longs pay shorts hourly. You collect it.
                    </Text>
                  </View>
                </View>

                {/* 3. 10% Reserve Buffer */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <Shield size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Liquidation Buffer</Text>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      10% in liquid AUSD protects against spikes.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Step 1 Visual Container */}
              <View style={styles.heroImageContainerStep1}>
                <Image
                  source={require("../../assets/onboarding/step1.jpg")}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
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
                  Two Monad venues, one tap.
                </Text>
              </View>

              {/* Explanatory Cards for Venues */}
              <View style={styles.cardList}>
                {/* 1. Kuru CLOB */}
                <View style={styles.explainCard}>
                  <View style={[styles.cardIconBoxLarge, { backgroundColor: "transparent" }]}>
                    <KuruLogo size={44} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>Kuru Spot CLOB</Text>
                      <View style={[styles.venueBadge, { backgroundColor: "rgba(255, 87, 34, 0.15)" }]}>
                        <Text style={[styles.venueBadgeText, { color: colors.kuruOrange }]}>Spot Order Book</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Onchain order book. We buy spot MON here.
                    </Text>
                  </View>
                </View>

                {/* 2. Perpl DEX */}
                <View style={styles.explainCard}>
                  <View style={[styles.cardIconBoxLarge, { backgroundColor: "transparent" }]}>
                    <PerplLogo size={44} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>Perpl (Market 64)</Text>
                      <View style={[styles.venueBadge, { backgroundColor: "rgba(131, 110, 249, 0.15)" }]}>
                        <Text style={[styles.venueBadgeText, { color: colors.monadViolet }]}>Perpetuals DEX</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Perp DEX. We open the 1x short hedge here.
                    </Text>
                  </View>
                </View>

                {/* 3. CarryLedger Contract */}
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <Layers size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>CarryLedger Smart Contract</Text>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Non-custodial ledger. Records every hedge.
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
                  Secured inside your hardware Secure Enclave.
                </Text>
              </View>

              {/* Step 3 Hero Image Container (~400px height, matching card width) */}
              <View style={styles.heroImageContainer}>
                <Image
                  source={require("../../assets/onboarding/step3.jpg")}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>

              {/* Security Explanations */}
              <View style={styles.cardList}>
                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <Lock size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Hardware Passkeys</Text>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Keys are created on your device. Never shared.
                    </Text>
                  </View>
                </View>

                <View style={styles.explainCard}>
                  <View style={styles.cardIconBoxLarge}>
                    <CheckCircle2 size={22} color={colors.lime} strokeWidth={2.4} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>Monad Account</Text>
                      <Text style={styles.cardAddress}>
                        {vaultAddress ? `${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}` : "Deriving..."}
                      </Text>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={1}>
                      Monad Testnet 10143. Trade keys stay in hardware.
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
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryButtonText}>Next: DEX Integrations</Text>
              <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
            </TouchableOpacity>
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
                    Unlock Vault ({capabilities.label})
                  </Text>
                  <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
  cardIconBoxLarge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
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
  heroImageContainer: {
    width: "100%",
    height: 267,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    marginVertical: space.md,
  },
  heroImageContainerStep1: {
    width: "100%",
    height: 140,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    marginTop: space.xs,
    marginBottom: space.xs,
  },
  heroImage: {
    width: "100%",
    height: "100%",
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
