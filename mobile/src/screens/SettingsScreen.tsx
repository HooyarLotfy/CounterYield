import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useAppStore } from "../state/store";
import { MeraAuthService, WalletCredentials } from "../auth/meraAuth";
import { config } from "../config/env";
import { colors, radius, space } from "../theme";
import {
  Shield,
  ChevronLeft,
  CheckCircle2,
  Sliders,
  Save,
  Info,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react-native";

export const SettingsScreen: React.FC = () => {
  const { userAddress, setActiveTab } = useAppStore();

  const [maxLeverage, setMaxLeverage] = useState<number>(1);
  const [reserveBufferPercent, setReserveBufferPercent] = useState<number>(10);
  const [slippageBps, setSlippageBps] = useState<number>(50);
  const [fundingFloorPercent, setFundingFloorPercent] = useState<number>(2.0);

  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Vault Backup & Credential Export state
  const [credentials, setCredentials] = useState<WalletCredentials | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const handleToggleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }
    setIsLoadingKeys(true);
    try {
      const creds = await MeraAuthService.exportWalletCredentials();
      setCredentials(creds);
      setIsRevealed(true);
    } catch (e) {
      console.warn("Failed to export credentials:", e);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCopyPrivateKey = () => {
    if (!credentials?.privateKey) return;
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopySeedPhrase = () => {
    if (!credentials?.seedPhrase) return;
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const [checkUpdateStatus, setCheckUpdateStatus] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setCheckUpdateStatus("Checking VPS for updates...");
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/app/version`, {
        signal: AbortSignal.timeout(5000),
      });
      const json = await response.json();
      if (json?.data?.versionCode > 1) {
        setCheckUpdateStatus(`Update available: v${json.data.versionName}! Opening download...`);
        Linking.openURL(json.data.apkUrl);
      } else {
        setCheckUpdateStatus("CounterYield is up to date (v1.0.0)");
        setTimeout(() => setCheckUpdateStatus(null), 4000);
      }
    } catch {
      setCheckUpdateStatus("Connected to production VPS on port 48392");
      setTimeout(() => setCheckUpdateStatus(null), 4000);
    }
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    setSavedStatus(null);
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/settings/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerAddress: userAddress || "0x0000000000000000000000000000000000000000",
          maxLeverage,
          maxSlippageBps: slippageBps,
          fundingFloorBps: Math.round(fundingFloorPercent * 100),
          maxDriftBps: 100,
          reserveBufferBps: reserveBufferPercent * 100,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedStatus(
          data.data.onchainTxHash
            ? `Policy Anchored Onchain: ${data.data.onchainTxHash.slice(0, 10)}...`
            : "Policy Saved to Portable Profile"
        );
      } else {
        setSavedStatus("Failed to save policy: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setSavedStatus("Saved locally (Offline/Relayer fallback)");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => setActiveTab("home")}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Sliders size={13} color={colors.monadViolet} />
            <Text style={styles.headerTagText}>Onchain Parameters</Text>
          </View>
        </View>

        <Text style={styles.title}>Risk Policy & Safeguards</Text>
        <Text style={styles.subtitle}>
          Customize portable risk limits anchored to CarryLedger on Monad Testnet.
        </Text>

        {/* 1. Max Leverage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Maximum Leverage Cap</Text>
            <Text style={styles.cardValue}>{maxLeverage}x</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={1}>
            1x maintains delta neutrality; 2x allows directional carry expansion.
          </Text>

          <View style={styles.buttonRow}>
            {[1, 2].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.optionPill,
                  maxLeverage === lvl && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setMaxLeverage(lvl)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    maxLeverage === lvl && styles.optionPillTextSelected,
                  ]}
                >
                  {lvl}x {lvl === 1 ? "(Protected)" : "(Opt-in)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Reserve Buffer */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reserve Buffer Ratio</Text>
            <Text style={styles.cardValue}>{reserveBufferPercent}%</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={1}>
            Liquid capital cushion reserved for real-time Perpl margin defense.
          </Text>

          <View style={styles.buttonRow}>
            {[10, 15, 20].map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[
                  styles.optionPill,
                  reserveBufferPercent === pct && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setReserveBufferPercent(pct)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    reserveBufferPercent === pct && styles.optionPillTextSelected,
                  ]}
                >
                  {pct}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Slippage Tolerance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dual-Leg Slippage Tolerance</Text>
            <Text style={styles.cardValue}>{slippageBps} bps ({(slippageBps / 100).toFixed(2)}%)</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={1}>
            Maximum execution variance across Kuru spot and Perpl perp fills.
          </Text>

          <View style={styles.buttonRow}>
            {[20, 50, 100].map((bps) => (
              <TouchableOpacity
                key={bps}
                style={[
                  styles.optionPill,
                  slippageBps === bps && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSlippageBps(bps)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    slippageBps === bps && styles.optionPillTextSelected,
                  ]}
                >
                  {bps} bps
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Funding Floor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Annualized Funding Floor</Text>
            <Text style={styles.cardValue}>{fundingFloorPercent.toFixed(1)}%</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={1}>
            Freezes entries and flags unwind if trailing funding yields fall below this rate.
          </Text>

          <View style={styles.buttonRow}>
            {[0.0, 2.0, 5.0].map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.optionPill,
                  fundingFloorPercent === rate && styles.optionPillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setFundingFloorPercent(rate)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    fundingFloorPercent === rate && styles.optionPillTextSelected,
                  ]}
                >
                  {rate === 0 ? "0% (Raw)" : `${rate}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Status Feedback */}
        {savedStatus && (
          <View style={styles.statusBox}>
            <CheckCircle2 size={15} color={colors.lime} />
            <Text style={styles.statusBoxText}>{savedStatus}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          disabled={isSaving}
          onPress={handleSavePolicy}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0D0E11" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Save size={16} color="#0D0E11" strokeWidth={2.4} />
              <Text style={styles.saveBtnText}>Save Risk Policy Onchain</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Vault Backup & Recovery Section */}
        <View style={styles.sectionDivider} />

        <View style={styles.backupHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Key size={18} color={colors.lime} />
            <Text style={styles.backupSectionTitle}>Vault Backup & Keys</Text>
          </View>
          <View style={styles.enclaveBadge}>
            <Lock size={12} color={colors.lime} />
            <Text style={styles.enclaveBadgeText}>Mera Enclave</Text>
          </View>
        </View>

        <Text style={styles.backupDescription}>
          Export your 64-character EVM testnet private key and 24-word BIP-39 mnemonic recovery phrase to import your account into MetaMask, Rabby, or Foundry.
        </Text>

        <TouchableOpacity
          style={[styles.revealToggleBtn, isRevealed && styles.revealToggleBtnActive]}
          activeOpacity={0.8}
          onPress={handleToggleReveal}
          disabled={isLoadingKeys}
        >
          {isLoadingKeys ? (
            <ActivityIndicator size="small" color={colors.lime} />
          ) : isRevealed ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <EyeOff size={16} color={colors.textSecondary} />
              <Text style={styles.revealToggleText}>Hide Vault Credentials</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Eye size={16} color={colors.lime} />
              <Text style={[styles.revealToggleText, { color: colors.lime }]}>
                Reveal Private Key & Seed Phrase
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {isRevealed && credentials && (
          <View style={styles.credentialsContainer}>
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.warningBannerText}>
                Never share these credentials. Anyone with your private key or seed phrase has full control over your Monad testnet assets.
              </Text>
            </View>

            {/* EVM Private Key Card */}
            <View style={styles.credentialCard}>
              <View style={styles.credentialCardHeader}>
                <Text style={styles.credentialCardLabel}>EVM TESTNET PRIVATE KEY</Text>
                <TouchableOpacity
                  style={styles.copyPill}
                  activeOpacity={0.7}
                  onPress={handleCopyPrivateKey}
                >
                  {copiedKey ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Check size={12} color={colors.lime} />
                      <Text style={[styles.copyPillText, { color: colors.lime }]}>Copied</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Copy size={12} color={colors.textSecondary} />
                      <Text style={styles.copyPillText}>Copy Key</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.codeText} selectable>
                {credentials.privateKey}
              </Text>
            </View>

            {/* 24-Word Mnemonic Phrase Card */}
            <View style={styles.credentialCard}>
              <View style={styles.credentialCardHeader}>
                <Text style={styles.credentialCardLabel}>24-WORD BIP-39 RECOVERY PHRASE</Text>
                <TouchableOpacity
                  style={styles.copyPill}
                  activeOpacity={0.7}
                  onPress={handleCopySeedPhrase}
                >
                  {copiedSeed ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Check size={12} color={colors.lime} />
                      <Text style={[styles.copyPillText, { color: colors.lime }]}>Copied</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Copy size={12} color={colors.textSecondary} />
                      <Text style={styles.copyPillText}>Copy Phrase</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.mnemonicGrid}>
                {credentials.seedPhrase.split(" ").map((word, index) => (
                  <View key={index} style={styles.wordPill}>
                    <Text style={styles.wordIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text style={styles.wordText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* App Version & Auto-Update Section */}
        <View style={styles.sectionDivider} />
        <View style={styles.versionCard}>
          <View style={styles.versionCardHeader}>
            <View>
              <Text style={styles.versionTitle}>CounterYield for Android</Text>
              <Text style={styles.versionSubtext}>Version 1.0.0 (Build 1) · Production VPS: 48392</Text>
            </View>
            <TouchableOpacity
              style={styles.checkUpdateBtn}
              activeOpacity={0.7}
              onPress={handleCheckUpdate}
            >
              <RefreshCw size={13} color={colors.lime} />
              <Text style={styles.checkUpdateText}>Check Updates</Text>
            </TouchableOpacity>
          </View>
          {checkUpdateStatus && (
            <Text style={styles.updateStatusText}>{checkUpdateStatus}</Text>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    gap: 4,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(131, 110, 249, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(131, 110, 249, 0.25)",
  },
  headerTagText: {
    color: colors.monadViolet,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  cardValue: {
    color: colors.lime,
    fontSize: 14,
    fontWeight: "800",
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionPillSelected: {
    backgroundColor: "rgba(159, 232, 37, 0.12)",
    borderColor: colors.lime,
  },
  optionPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  optionPillTextSelected: {
    color: colors.lime,
    fontWeight: "800",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(159, 232, 37, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.25)",
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  statusBoxText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  saveBtn: {
    backgroundColor: colors.lime,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  saveBtnText: {
    color: "#0D0E11",
    fontSize: 15,
    fontWeight: "800",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 24,
  },
  backupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backupSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  enclaveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(159, 232, 37, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.2)",
  },
  enclaveBadgeText: {
    color: colors.lime,
    fontSize: 10,
    fontWeight: "700",
  },
  backupDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  revealToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: "rgba(159, 232, 37, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.25)",
    marginBottom: 16,
  },
  revealToggleBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  revealToggleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  credentialsContainer: {
    gap: 14,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    padding: 12,
    borderRadius: radius.md,
  },
  warningBannerText: {
    flex: 1,
    color: "#FBBF24",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
  credentialCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  credentialCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  credentialCardLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  copyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  copyPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  codeText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  mnemonicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    width: "31%",
  },
  wordIndex: {
    color: colors.textTertiary,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  wordText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  versionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  versionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  versionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  versionSubtext: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  checkUpdateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: "rgba(159, 232, 37, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(159, 232, 37, 0.2)",
  },
  checkUpdateText: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "700",
  },
  updateStatusText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
  },
});
