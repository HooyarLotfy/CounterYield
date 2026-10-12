import React, { useState } from "react";
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
import { MeraAuthService } from "../auth/meraAuth";
import { colors, radius, space } from "../theme";
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react-native";

export const WelcomeScreen: React.FC = () => {
  const { authenticate, loadDemoTestingPreset } = useAppStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleBiometricUnlock = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await MeraAuthService.unlockVault();
      if (result.success && result.address) {
        authenticate(result.address);
      } else {
        setAuthError("Biometric authentication was cancelled or unavailable.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to unlock biometric vault.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Monad Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.networkDot} />
          <Text style={styles.badgeText}>Monad Testnet · Chain 10143</Text>
        </View>

        {/* Hero Branding with Shield Glow */}
        <View style={styles.heroSection}>
          <View style={styles.shieldGlow}>
            <View style={styles.shieldInner}>
              <ShieldCheck size={42} color={colors.lime} strokeWidth={2.2} />
            </View>
          </View>

          <Text style={styles.brandTitle}>CounterYield</Text>
          <Text style={styles.brandTagline}>
            Delta-Neutral Basis Yield on Monad
          </Text>
          <Text style={styles.brandDescription}>
            Institutional cash-and-carry funding arbitrage packaged into a consumer mobile primitive.
            Secured by WebAuthn Passkeys & hardware PRF session isolation.
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Zap size={18} color={colors.lime} strokeWidth={2.4} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Delta-Neutral Carry</Text>
              <Text style={styles.featureSub}>Kuru Spot + Perpl 1x Short (Δ ≈ $0)</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Lock size={18} color={colors.lime} strokeWidth={2.4} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Hardware PRF Isolation</Text>
              <Text style={styles.featureSub}>Secure Enclave / TPM Face ID key derivation</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Sparkles size={18} color={colors.lime} strokeWidth={2.4} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>3-Tier Risk Guard</Text>
              <Text style={styles.featureSub}>Automated 10% reserve buffer & 1-tap exit</Text>
            </View>
          </View>
        </View>

        {/* Error Feedback */}
        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            disabled={isAuthenticating}
            onPress={handleBiometricUnlock}
          >
            {isAuthenticating ? (
              <ActivityIndicator color={colors.textDark} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  Unlock with Face ID / Passkey
                </Text>
                <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Preset for Hackathon / Testing */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={loadDemoTestingPreset}
          >
            <Text style={styles.secondaryButtonText}>
              ⚡ Quick Testnet Preset (Judges Demo)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Non-custodial. No seed phrases stored on servers. Powered by Mera.
        </Text>
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
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "android" ? 20 : 12,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.limeMuted,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: 8,
  },
  badgeText: {
    color: colors.lime,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 10,
  },
  shieldGlow: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.limeMuted,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  shieldInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  brandTagline: {
    color: colors.lime,
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  brandDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  featureGrid: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 18,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.limeMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  featureSub: {
    color: colors.textSecondary,
    fontSize: 11.5,
  },
  errorBanner: {
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
    borderRadius: radius.md,
    padding: 12,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  buttonGroup: {
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginBottom: 10,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: colors.textDark,
    fontSize: 14.5,
    fontWeight: "800",
    marginRight: 8,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  footerNote: {
    color: colors.textTertiary,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 6,
  },
});
