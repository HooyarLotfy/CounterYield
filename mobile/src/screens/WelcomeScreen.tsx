import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAppStore } from "../state/store";
import { MeraAuthService } from "../auth/meraAuth";
import { colors, radius, space } from "../theme";

export const WelcomeScreen: React.FC = () => {
  const { authenticate } = useAppStore();
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
        setAuthError("Biometric authentication was cancelled or failed.");
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

        {/* Hero Branding & Illuminated Shield */}
        <View style={styles.heroSection}>
          <View style={styles.shieldGlow}>
            <View style={styles.shieldInner}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
          </View>

          <Text style={styles.brandTitle}>CounterYield</Text>
          <Text style={styles.brandTagline}>
            Automated Delta-Neutral Dollar Yield
          </Text>
          <Text style={styles.brandDescription}>
            Institutional cash-and-carry funding arbitrage on Monad.
            Zero wallet jargon, zero seed phrases, secured by biometric Passkeys.
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>⚡</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Delta-Neutral Carry</Text>
              <Text style={styles.featureSub}>Kuru Spot + Perpl 1x Short (Δ ≈ $0)</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>🔒</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Hardware PRF Isolation</Text>
              <Text style={styles.featureSub}>WebAuthn Secure Enclave & Face ID</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>🛡️</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>3-Tier Risk Guard</Text>
              <Text style={styles.featureSub}>Automated reserve buffer & 1-tap exit</Text>
            </View>
          </View>
        </View>

        {/* Auth Error Feedback */}
        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {/* Biometric CTA Action */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            disabled={isAuthenticating}
            onPress={handleBiometricUnlock}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#0A0D14" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.passkeyIcon}>🪪</Text>
                <Text style={styles.buttonText}>Unlock with Face ID / Passkey</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNotice}>
            Secured by @category-labs/mera · Non-Custodial Vault
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    justifyContent: "space-between",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lime,
    marginRight: space.xs + 2,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  heroSection: {
    alignItems: "center",
    marginTop: space.lg,
  },
  shieldGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.limeSoft,
    borderWidth: 2,
    borderColor: colors.limeLine,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  shieldInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lime,
  },
  shieldIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.snow,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.lime,
    marginTop: space.xs,
    textAlign: "center",
  },
  brandDescription: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 19,
    marginTop: space.sm,
    paddingHorizontal: space.md,
  },
  featureGrid: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.md,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.snow,
  },
  featureSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderWidth: 1,
    borderColor: colors.crimson,
    padding: space.sm,
    borderRadius: radius.sm,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  footerSection: {
    alignItems: "center",
    gap: space.sm,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.lime,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs + 2,
  },
  passkeyIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  footerNotice: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "500",
  },
});
