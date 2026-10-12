import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useAppStore } from "../state/store";
import { colors, radius, space } from "../theme";
import {
  Shield,
  Zap,
  ArrowDownLeft,
  XOctagon,
  ChevronDown,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react-native";

export const HomeScreen: React.FC = () => {
  const {
    userAddress,
    walletBalanceAusd,
    activePosition,
    setActiveTab,
    openUnwindModal,
    openRiskGuardModal,
    loadDemoTestingPreset,
    logout,
  } = useAppStore();

  const formattedAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "Not Connected";

  const hasPosition = !!activePosition && activePosition.state === "ACTIVE";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Trust Wallet Top Header */}
        <View style={styles.header}>
          {/* Wallet Selector Pill */}
          <TouchableOpacity
            style={styles.walletPill}
            activeOpacity={0.7}
            onPress={logout}
          >
            <View style={styles.walletIconBox}>
              <Shield size={14} color={colors.lime} strokeWidth={2.4} />
            </View>
            <Text style={styles.walletAddress}>{formattedAddress}</Text>
            <ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Network Badge */}
          <View style={styles.networkBadge}>
            <View style={styles.networkDotPulse} />
            <Text style={styles.networkName}>Monad Testnet</Text>
          </View>
        </View>

        {/* Monumental Balance Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>Total Earning Balance</Text>
            <View style={styles.chainPill}>
              <Text style={styles.chainPillText}>10143</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.heroBalance}>
              ${walletBalanceAusd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.heroCurrency}>AUSD</Text>
          </View>

          {/* Micro Trend / Status Bar */}
          <View style={styles.metricBanner}>
            <View style={styles.metricItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, hasPosition ? styles.dotGreen : styles.dotIdle]} />
                <Text style={styles.statusText}>
                  {hasPosition
                    ? `Δ = $${activePosition.netDeltaDollars.toFixed(2)} (Neutral)`
                    : "Ready to Earn"}
                </Text>
              </View>
            </View>

            <View style={styles.aprItem}>
              <TrendingUp size={13} color={colors.lime} strokeWidth={2.5} />
              <Text style={styles.aprValue}>
                +{( (activePosition?.estimatedApr ?? 0.184) * 100 ).toFixed(1)}% APY
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button Row (Trust Wallet Pill/Circle Standard) */}
        <View style={styles.actionGrid}>
          {/* Deposit */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            onPress={() => setActiveTab("earn")}
          >
            <View style={styles.actionCircle}>
              <ArrowDownLeft size={20} color={colors.textPrimary} strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>

          {/* Start Earning */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            onPress={() => setActiveTab("earn")}
          >
            <View style={[styles.actionCircle, styles.actionCircleHighlight]}>
              <Zap size={20} color={colors.textDark} strokeWidth={2.4} />
            </View>
            <Text style={[styles.actionText, styles.actionTextHighlight]}>Earn</Text>
          </TouchableOpacity>

          {/* Risk Guard */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            onPress={() => openRiskGuardModal(true)}
          >
            <View style={styles.actionCircle}>
              <Shield size={20} color={colors.textPrimary} strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Security</Text>
          </TouchableOpacity>

          {/* 1-Tap Unwind */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.75}
            disabled={!hasPosition}
            onPress={() => openUnwindModal(true)}
          >
            <View style={[styles.actionCircle, !hasPosition && styles.actionCircleDisabled]}>
              <XOctagon
                size={20}
                color={hasPosition ? colors.crimson : colors.textTertiary}
                strokeWidth={2}
              />
            </View>
            <Text style={[styles.actionText, hasPosition && styles.actionTextAlarm]}>
              Unwind
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area: Zero-Position State OR Dual-Leg Active Breakdown */}
        {!hasPosition ? (
          <View style={styles.zeroStateCard}>
            <View style={styles.zeroStateHeader}>
              <View style={styles.zeroStateIconBox}>
                <Sparkles size={22} color={colors.lime} strokeWidth={2.2} />
              </View>
              <View style={styles.zeroStateTextGroup}>
                <Text style={styles.zeroStateTitle}>Start Delta-Neutral Yield</Text>
                <Text style={styles.zeroStateSub}>
                  Deposit AUSD to lock zero-directional risk and earn funding rates on Monad.
                </Text>
              </View>
            </View>

            {/* Value Props Row */}
            <View style={styles.propsList}>
              <View style={styles.propRow}>
                <CheckCircle2 size={15} color={colors.lime} strokeWidth={2.2} />
                <Text style={styles.propText}>Automatic Kuru CLOB spot + Perpl short pair</Text>
              </View>
              <View style={styles.propRow}>
                <CheckCircle2 size={15} color={colors.lime} strokeWidth={2.2} />
                <Text style={styles.propText}>3-Tier Risk Guard buffer protects against wicks</Text>
              </View>
              <View style={styles.propRow}>
                <CheckCircle2 size={15} color={colors.lime} strokeWidth={2.2} />
                <Text style={styles.propText}>Hardware WebAuthn PRF session key isolation</Text>
              </View>
            </View>

            {/* Launch CTA */}
            <TouchableOpacity
              style={styles.primaryCtaBtn}
              activeOpacity={0.85}
              onPress={() => setActiveTab("earn")}
            >
              <Text style={styles.primaryCtaText}>Deposit & Open Hedge</Text>
              <ArrowRight size={18} color={colors.textDark} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Testing Shortcut for Hackathon Judges */}
            <TouchableOpacity
              style={styles.presetLink}
              activeOpacity={0.7}
              onPress={loadDemoTestingPreset}
            >
              <Text style={styles.presetLinkText}>⚡ Load Verified Testnet State Preset</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.positionSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dual-Leg Capital Allocation</Text>
              <View style={styles.auditedBadge}>
                <Lock size={11} color={colors.agoraGreen} strokeWidth={2.4} />
                <Text style={styles.auditedText}>CarryLedger Proof</Text>
              </View>
            </View>

            {/* Leg 1: Kuru Spot */}
            <TouchableOpacity
              style={styles.legCard}
              activeOpacity={0.8}
              onPress={() => setActiveTab("spot")}
            >
              <View style={styles.legCardHeader}>
                <View style={styles.legTitleRow}>
                  <View style={[styles.venueDot, { backgroundColor: colors.kuruOrange }]} />
                  <Text style={styles.legTitle}>Leg 1: Kuru Spot (Long)</Text>
                </View>
                <View style={styles.venueTag}>
                  <Text style={styles.venueTagText}>Kuru CLOB</Text>
                </View>
              </View>

              <View style={styles.legDetailsGrid}>
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Position Size</Text>
                  <Text style={styles.cellValue}>
                    {activePosition.spotQuantity.toFixed(1)} MON
                  </Text>
                  <Text style={styles.cellSub}>
                    (${(activePosition.spotQuantity * activePosition.spotPrice).toFixed(2)})
                  </Text>
                </View>

                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Entry Price</Text>
                  <Text style={styles.cellValue}>
                    ${activePosition.spotPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.cellSub}>AUSD</Text>
                </View>

                <View style={[styles.gridCell, styles.gridCellRight]}>
                  <Text style={styles.cellLabel}>Structure</Text>
                  <Text style={[styles.cellValue, { color: colors.lime }]}>
                    100% Spot
                  </Text>
                  <Text style={styles.cellSub}>No Liq Risk</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Leg 2: Perpl Short */}
            <TouchableOpacity
              style={styles.legCard}
              activeOpacity={0.8}
              onPress={() => openRiskGuardModal(true)}
            >
              <View style={styles.legCardHeader}>
                <View style={styles.legTitleRow}>
                  <View style={[styles.venueDot, { backgroundColor: colors.monadViolet }]} />
                  <Text style={styles.legTitle}>Leg 2: Perpl MON Perp (1x Short)</Text>
                </View>
                <View style={styles.venueTag}>
                  <Text style={styles.venueTagText}>Perpl DEX (64)</Text>
                </View>
              </View>

              <View style={styles.legDetailsGrid}>
                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Hedged Size</Text>
                  <Text style={styles.cellValue}>
                    -{activePosition.perpQuantity.toFixed(1)} MON
                  </Text>
                  <Text style={styles.cellSub}>
                    (${(activePosition.perpQuantity * activePosition.perpMarkPrice).toFixed(2)})
                  </Text>
                </View>

                <View style={styles.gridCell}>
                  <Text style={styles.cellLabel}>Margin Ratio</Text>
                  <Text style={[styles.cellValue, { color: colors.lime }]}>
                    {(activePosition.marginRatio * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.cellSub}>Tier: Normal</Text>
                </View>

                <View style={[styles.gridCell, styles.gridCellRight]}>
                  <Text style={styles.cellLabel}>Funding Accrued</Text>
                  <Text style={[styles.cellValue, { color: colors.lime }]}>
                    +${activePosition.accruedFundingEst.toFixed(2)}
                  </Text>
                  <Text style={styles.cellSub}>AUSD</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Space for bottom dock */}
        <View style={{ height: 110 }} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  walletIconBox: {
    marginRight: 6,
  },
  walletAddress: {
    color: colors.textPrimary,
    fontSize: 12.5,
    fontWeight: "600",
    marginRight: 4,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.limeMuted,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  networkDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: 6,
  },
  networkName: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  heroCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  chainPill: {
    backgroundColor: colors.glassFillLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  chainPillText: {
    color: colors.textTertiary,
    fontSize: 10.5,
    fontWeight: "600",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  heroBalance: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  heroCurrency: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  metricBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotGreen: {
    backgroundColor: colors.lime,
  },
  dotIdle: {
    backgroundColor: colors.textTertiary,
  },
  statusText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
  },
  aprItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.limeMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  aprValue: {
    color: colors.lime,
    fontSize: 12.5,
    fontWeight: "700",
    marginLeft: 4,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  actionBtn: {
    alignItems: "center",
    flex: 1,
  },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionCircleHighlight: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  actionCircleDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: "600",
  },
  actionTextHighlight: {
    color: colors.lime,
    fontWeight: "700",
  },
  actionTextAlarm: {
    color: colors.crimson,
  },
  zeroStateCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 22,
  },
  zeroStateHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  zeroStateIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.limeMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  zeroStateTextGroup: {
    flex: 1,
  },
  zeroStateTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  zeroStateSub: {
    color: colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },
  propsList: {
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  propRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  propText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  primaryCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    borderRadius: radius.lg,
    paddingVertical: 14,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  primaryCtaText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "800",
    marginRight: 8,
  },
  presetLink: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 4,
  },
  presetLinkText: {
    color: colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "600",
  },
  positionSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  auditedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 210, 106, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  auditedText: {
    color: colors.agoraGreen,
    fontSize: 10.5,
    fontWeight: "600",
    marginLeft: 4,
  },
  legCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
  },
  legCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  legTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  venueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legTitle: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  venueTag: {
    backgroundColor: colors.glassFillLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  venueTagText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: "600",
  },
  legDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridCell: {
    flex: 1,
  },
  gridCellRight: {
    alignItems: "flex-end",
  },
  cellLabel: {
    color: colors.textTertiary,
    fontSize: 10.5,
    fontWeight: "500",
    marginBottom: 3,
  },
  cellValue: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  cellSub: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },
});
