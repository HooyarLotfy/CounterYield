import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAppStore } from "../state/store";
import { MeraAuthService, BiometricCapability } from "../auth/meraAuth";
import { colors, radius, space, spore } from "../theme";
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Fingerprint,
  Smartphone,
  Eye,
} from "lucide-react-native";

export const WelcomeScreen: React.FC = () => {
  const { authenticate, loadDemoTestingPreset } = useAppStore();
  
  // Multi-step onboarding: 1 = Landing, 2 = Biometrics & Security, 3 = Vault Ready
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<BiometricCapability>({
    hasHardware: false,
    isEnrolled: false,
    biometryType: "PASSKEY",
    label: "Face ID / Passkey",
  });
  const [vaultAddress, setVaultAddress] = useState<string>("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");

  // Query hardware capabilities on mount
  useEffect(() => {
    MeraAuthService.checkCapabilities().then((caps) => {
      setCapabilities(caps);
    });
  }, []);

  const handleBiometricEnrollment = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await MeraAuthService.unlockVault(
        `Enroll ${capabilities.label} for CounterYield`
      );
      if (result.success && result.address) {
        setVaultAddress(result.address);
        setStep(3);
      } else {
        setAuthError(result.error || "Biometric authentication cancelled.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to trigger biometrics.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkipToReady = () => {
    setVaultAddress(MeraAuthService.getPrimaryAddress());
    setStep(3);
  };

  const handleEnterApp = () => {
    authenticate(vaultAddress);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Indicator Header (Steps 2 & 3) */}
        {step > 1 && (
          <View style={styles.stepperHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : 1))}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.stepperDots}>
              <View style={[styles.dot, step >= 1 && styles.dotActive]} />
              <View style={[styles.dot, step >= 2 && styles.dotActive]} />
              <View style={[styles.dot, step >= 3 && styles.dotActive]} />
            </View>

            <View style={styles.stepperRightPlaceholder} />
          </View>
        )}

        {/* STEP 1: LANDING & DISCOVERY */}
        {step === 1 && (
          <View style={styles.stepContent}>
            {/* Top Monad Badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.networkDot} />
              <Text style={styles.badgeText}>Monad Testnet · Chain 10143</Text>
            </View>

            {/* Hero Branding */}
            <View style={styles.heroSection}>
              <Text style={styles.brandTitle}>CounterYield</Text>
              <Text style={styles.brandTagline}>
                Institutional carry yield, simplified.
              </Text>
            </View>

            {/* 3 Uniswap OptionCards */}
            <View style={styles.featureList}>
              <View style={styles.optionCard}>
                <View style={styles.iconCircle}>
                  <Zap size={18} color={colors.lime} strokeWidth={2.4} />
                </View>
                <View style={styles.optionTextBox}>
                  <View style={styles.optionHeaderRow}>
                    <Text style={styles.optionTitle}>Delta-Neutral Carry</Text>
                    <View style={styles.optionBadge}>
                      <Text style={styles.optionBadgeText}>Δ ≈ 0</Text>
                    </View>
                  </View>
                  <Text style={styles.optionSub}>
                    Kuru spot long paired with Perpl 1x short hedge.
                  </Text>
                </View>
              </View>

              <View style={styles.optionCard}>
                <View style={styles.iconCircle}>
                  <Lock size={18} color={colors.lime} strokeWidth={2.4} />
                </View>
                <View style={styles.optionTextBox}>
                  <View style={styles.optionHeaderRow}>
                    <Text style={styles.optionTitle}>Secure Enclave Keys</Text>
                    <View style={styles.optionBadge}>
                      <Text style={styles.optionBadgeText}>PRF</Text>
                    </View>
                  </View>
                  <Text style={styles.optionSub}>
                    Hardware-isolated session keys unlocked via biometrics.
                  </Text>
                </View>
              </View>

              <View style={styles.optionCard}>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={18} color={colors.lime} strokeWidth={2.4} />
                </View>
                <View style={styles.optionTextBox}>
                  <View style={styles.optionHeaderRow}>
                    <Text style={styles.optionTitle}>Automated Risk Guard</Text>
                    <View style={styles.optionBadge}>
                      <Text style={styles.optionBadgeText}>10% Buffer</Text>
                    </View>
                  </View>
                  <Text style={styles.optionSub}>
                    Automatic liquidation protection and 1-tap exit.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.bottomDock}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => setStep(2)}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
                <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={loadDemoTestingPreset}
              >
                <Text style={styles.secondaryButtonText}>
                  ⚡ Load Demo Preset (Judges)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: BIOMETRIC & SECURITY ENROLLMENT */}
        {step === 2 && (
          <View style={styles.stepContent}>
            {/* Visual Icon */}
            <View style={styles.securityIconContainer}>
              <View style={styles.securityIconGlow}>
                <View style={styles.securityIconInner}>
                  {capabilities.biometryType === "FACE_ID" ? (
                    <Eye size={36} color={colors.lime} strokeWidth={2.2} />
                  ) : capabilities.biometryType === "TOUCH_ID" ||
                    capabilities.biometryType === "FINGERPRINT" ? (
                    <Fingerprint size={36} color={colors.lime} strokeWidth={2.2} />
                  ) : (
                    <Lock size={36} color={colors.lime} strokeWidth={2.2} />
                  )}
                </View>
              </View>
            </View>

            {/* Step 2 Copy */}
            <View style={styles.securityCopy}>
              <Text style={styles.screenHeading}>
                Protect with {capabilities.label}
              </Text>
              <Text style={styles.screenSubheading}>
                CounterYield isolates trade-only keys in your device's hardware Secure Enclave.
              </Text>
            </View>

            {/* Live Hardware Status Chip */}
            <View style={styles.hardwareCard}>
              <View style={styles.hardwareRow}>
                <Smartphone size={16} color={colors.lime} strokeWidth={2} />
                <Text style={styles.hardwareTitle}>Hardware Secure Enclave</Text>
                <View style={styles.activeDot} />
              </View>
              <Text style={styles.hardwareDesc}>
                {capabilities.hasHardware
                  ? `${capabilities.label} detected on this device.`
                  : "Hardware passkey available for session encryption."}
              </Text>
            </View>

            {/* Error Feedback */}
            {authError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.bottomDock}>
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
                      Enable {capabilities.label}
                    </Text>
                    <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textActionBtn}
                activeOpacity={0.7}
                onPress={handleSkipToReady}
              >
                <Text style={styles.textActionText}>
                  Use Passcode / Set up later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: VAULT CREATED & READY */}
        {step === 3 && (
          <View style={styles.stepContent}>
            {/* Success Icon */}
            <View style={styles.securityIconContainer}>
              <View style={styles.securityIconGlow}>
                <View style={styles.securityIconInner}>
                  <CheckCircle2 size={40} color={colors.lime} strokeWidth={2.4} />
                </View>
              </View>
            </View>

            {/* Step 3 Copy */}
            <View style={styles.securityCopy}>
              <Text style={styles.screenHeading}>Your Vault is Ready</Text>
              <Text style={styles.screenSubheading}>
                Delta-neutral account provisioned on Monad Testnet.
              </Text>
            </View>

            {/* Provisioned Account Card */}
            <View style={styles.vaultCard}>
              <View style={styles.vaultCardTop}>
                <Text style={styles.vaultLabel}>Monad Account</Text>
                <View style={styles.networkBadgeInline}>
                  <View style={styles.networkDot} />
                  <Text style={styles.networkBadgeText}>Chain 10143</Text>
                </View>
              </View>

              <Text style={styles.vaultAddressText}>
                {vaultAddress.slice(0, 10)}...{vaultAddress.slice(-8)}
              </Text>

              <View style={styles.vaultDivider} />

              <View style={styles.vaultBalanceRow}>
                <Text style={styles.vaultBalanceLabel}>Available Balance</Text>
                <Text style={styles.vaultBalanceValue}>$1,000.00 AUSD</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.bottomDock}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={handleEnterApp}
              >
                <Text style={styles.primaryButtonText}>Enter CounterYield</Text>
                <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  stepperHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceCardElevated,
  },
  dotActive: {
    backgroundColor: colors.lime,
  },
  stepperRightPlaceholder: {
    width: 36,
  },
  stepContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: space.lg,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: space.sm,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  heroSection: {
    marginVertical: space.md,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  featureList: {
    gap: space.sm,
    marginVertical: space.sm,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.md,
    gap: space.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextBox: {
    flex: 1,
  },
  optionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  optionBadge: {
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.lime,
  },
  optionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  bottomDock: {
    gap: space.sm,
    marginTop: space.md,
  },
  primaryButton: {
    backgroundColor: colors.lime,
    height: 52,
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
    height: 48,
    borderRadius: radius.pill,
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
  textActionBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textActionText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  // Step 2 Styles
  securityIconContainer: {
    alignItems: "center",
    marginVertical: space.xl,
  },
  securityIconGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  securityIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  securityCopy: {
    alignItems: "center",
    paddingHorizontal: space.md,
    marginBottom: space.lg,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  screenSubheading: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: space.xs,
    lineHeight: 20,
  },
  hardwareCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.md,
    marginBottom: space.md,
  },
  hardwareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginBottom: 4,
  },
  hardwareTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  hardwareDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: colors.crimsonSoft,
    padding: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.crimson,
    marginBottom: space.sm,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    textAlign: "center",
  },
  // Step 3 Styles
  vaultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.lg,
    marginBottom: space.xl,
  },
  vaultCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xs,
  },
  vaultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  networkBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceCardElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  networkBadgeText: {
    fontSize: 10,
    color: colors.lime,
    fontWeight: "600",
  },
  vaultAddressText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginVertical: space.xs,
  },
  vaultDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: space.md,
  },
  vaultBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vaultBalanceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  vaultBalanceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.lime,
  },
});
