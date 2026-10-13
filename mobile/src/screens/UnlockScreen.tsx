import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useAppStore } from "../state/store";
import { MeraAuthService, BiometricCapability } from "../auth/meraAuth";
import { colors, radius, space } from "../theme";
import { MonadLogo } from "../components/Logos";
import {
  Fingerprint,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from "lucide-react-native";

interface UnlockScreenProps {
  onResetOnboarding?: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onResetOnboarding }) => {
  const { authenticate } = useAppStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<BiometricCapability>({
    hasHardware: false,
    isEnrolled: false,
    biometryType: "PASSKEY",
    label: "Touch ID / Face ID",
    isWeb: Platform.OS === "web",
  });
  const [vaultAddress, setVaultAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    MeraAuthService.checkCapabilities().then((caps) => {
      setCapabilities(caps);
    });
    MeraAuthService.getOrCreateDeviceWallet().then((w) => {
      setVaultAddress(w.address);
    });
  }, []);

  const handleUnlock = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await MeraAuthService.unlockVault(
        `Authenticate ${capabilities.label} to access CounterYield`
      );
      if (result.success && result.address) {
        authenticate(result.address);
      } else {
        setAuthError(result.error || "Authentication cancelled or timed out.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to trigger device biometrics.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCopyAddress = () => {
    if (!vaultAddress) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetWallet = () => {
    const confirmReset = async () => {
      await MeraAuthService.resetWallet();
      if (onResetOnboarding) {
        onResetOnboarding();
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Reset Enclave Wallet? This will restart the onboarding flow.")) {
        confirmReset();
      }
    } else {
      Alert.alert(
        "Reset Enclave Wallet?",
        "This will clear the current local passkey credentials and return to the intro setup screen.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: confirmReset },
        ]
      );
    }
  };

  const shortAddress = vaultAddress
    ? `${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`
    : "0x...";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Branding Strip */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MonadLogo size={22} />
            <Text style={styles.brandText}>CounterYield</Text>
          </View>
          <View style={styles.networkBadge}>
            <View style={styles.networkDot} />
            <Text style={styles.networkText}>Monad Testnet</Text>
          </View>
        </View>

        {/* Center Lock Chamber */}
        <View style={styles.centerChamber}>
          {/* Glowing Aura Ring */}
          <View style={styles.auraOuter}>
            <View style={styles.auraInner}>
              <TouchableOpacity
                style={styles.biometricCircle}
                activeOpacity={0.85}
                onPress={handleUnlock}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator size="large" color={colors.lime} />
                ) : (
                  <Fingerprint size={54} color={colors.lime} strokeWidth={1.8} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.vaultTitle}>Enclave Vault Locked</Text>
          <Text style={styles.vaultSubtitle}>
            Your delta-neutral carry positions and private keys are hardware-isolated.
          </Text>

          {/* Enclave Account Badge */}
          <View style={styles.accountCard}>
            <View style={styles.accountLeft}>
              <ShieldCheck size={16} color={colors.lime} />
              <View>
                <Text style={styles.accountLabel}>CONNECTED ENCLAVE ACCOUNT</Text>
                <Text style={styles.accountAddress}>{shortAddress}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              activeOpacity={0.7}
              onPress={handleCopyAddress}
            >
              {copied ? (
                <Check size={14} color={colors.lime} />
              ) : (
                <Copy size={14} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {authError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} numberOfLines={2}>
                {authError}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.primaryUnlockBtn}
            activeOpacity={0.85}
            onPress={handleUnlock}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator size="small" color="#0D0E11" />
            ) : (
              <>
                <Unlock size={18} color="#0D0E11" strokeWidth={2.4} />
                <Text style={styles.primaryUnlockText}>
                  Unlock with {capabilities.label}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.7}
            onPress={handleResetWallet}
          >
            <RefreshCw size={13} color={colors.textTertiary} />
            <Text style={styles.resetBtnText}>Switch / Reset Enclave Wallet</Text>
          </TouchableOpacity>
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
    paddingVertical: space.lg,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: space.sm,
  },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(159, 232, 37, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.2)",
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  networkText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.lime,
  },
  centerChamber: {
    alignItems: "center",
    paddingVertical: space.md,
  },
  auraOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(159, 232, 37, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.12)",
    marginBottom: space.xl,
  },
  auraInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(159, 232, 37, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.25)",
  },
  biometricCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#15171E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 6,
  },
  vaultTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  vaultSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  accountCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  accountAddress: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    marginTop: space.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    width: "100%",
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomArea: {
    gap: 12,
    paddingBottom: space.md,
  },
  primaryUnlockBtn: {
    backgroundColor: colors.lime,
    height: 54,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryUnlockText: {
    color: "#0D0E11",
    fontSize: 16,
    fontWeight: "800",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  resetBtnText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "600",
  },
});
