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
import { useBackendHealth } from "../services/useBackendData";
import { useTelemetry } from "../services/useTelemetry";
import { colors, radius, space } from "../theme";
import { KuruLogo, PerplLogo, AusdLogo, MonadLogo } from "../components/Logos";
import {
  Shield,
  Zap,
  ArrowDownLeft,
  XOctagon,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Lock,
  ArrowRight,
  Activity,
  CheckCircle2,
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

  const { blockNumber, rpcLatencyMs, isConnected } = useBackendHealth();
  const { isConnected: isWsConnected } = useTelemetry(activePosition?.positionId || null);

  const formattedAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "Not Connected";

  const hasPosition = !!activePosition && activePosition.state === "ACTIVE";
  const totalPortfolioValue = walletBalanceAusd + (hasPosition ? (activePosition.depositAmount || 0) : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Uniswap Account Header */}
        <View style={styles.header}>
          {/* Wallet Selector Pill */}
          <TouchableOpacity
            style={styles.walletPill}
            activeOpacity={0.7}
            onPress={logout}
          >
            <View style={styles.walletIconBox}>
              <Shield size={13} color={colors.lime} strokeWidth={2.4} />
            </View>
            <Text style={styles.walletAddress}>{formattedAddress}</Text>
            <ChevronDown size={13} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Network Badge with Live Telemetry */}
          <View style={styles.networkBadge}>
            <View style={[styles.networkDot, isConnected && styles.networkDotLive]} />
            <Text style={styles.networkName}>Monad Testnet</Text>
          </View>
        </View>

        {/* Monumental Hero Portfolio Overview */}
        <View style={styles.portfolioHero}>
          <Text style={styles.portfolioLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.heroBalance}>
              ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.heroCurrency}>AUSD</Text>
          </View>

          {/* Inline Financial Metric Pill */}
          <View style={styles.metricRow}>
            <View style={styles.aprChip}>
              <TrendingUp size={12} color={colors.lime} strokeWidth={2.5} />
              <Text style={styles.aprText}>
                +{( (activePosition?.estimatedApr ?? 0.184) * 100 ).toFixed(1)}% APY
              </Text>
            </View>

            <View style={styles.deltaChip}>
              <View style={[styles.deltaDot, hasPosition ? styles.deltaDotActive : styles.deltaDotIdle]} />
              <Text style={styles.deltaText}>
                {hasPosition ? `Δ = $${activePosition.netDeltaDollars.toFixed(2)} (Neutral)` : "Zero Delta"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4-Column Quick Actions Dock (Uniswap Standard) */}
        <View style={styles.actionGrid}>
          {/* 1. Deposit */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.75}
            onPress={() => setActiveTab("earn")}
          >
            <View style={styles.actionCircle}>
              <ArrowDownLeft size={20} color={colors.textPrimary} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Deposit</Text>
          </TouchableOpacity>

          {/* 2. Earn */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.75}
            onPress={() => setActiveTab("earn")}
          >
            <View style={[styles.actionCircle, styles.actionCircleActive]}>
              <Zap size={20} color={colors.textDark} strokeWidth={2.4} />
            </View>
            <Text style={[styles.actionLabel, styles.actionLabelActive]}>Earn</Text>
          </TouchableOpacity>

          {/* 3. Security */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.75}
            onPress={() => openRiskGuardModal(true)}
          >
            <View style={styles.actionCircle}>
              <Shield size={20} color={colors.textPrimary} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Security</Text>
          </TouchableOpacity>

          {/* 4. Unwind */}
          <TouchableOpacity
            style={styles.actionItem}
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
            <Text style={[styles.actionLabel, hasPosition && styles.actionLabelCritical]}>
              Unwind
            </Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Content: Empty State OR Dual-Leg Asset List */}
        {!hasPosition ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconBox}>
              <Sparkles size={22} color={colors.lime} strokeWidth={2.2} />
            </View>

            <Text style={styles.emptyTitle}>Automated Dollar Carry</Text>
            <Text style={styles.emptySubtitle}>
              Earn funding rates by pairing Kuru spot long with Perpl 1x short hedge.
            </Text>

            <TouchableOpacity
              style={styles.emptyCtaButton}
              activeOpacity={0.85}
              onPress={() => setActiveTab("earn")}
            >
              <Text style={styles.emptyCtaText}>Deposit & Open Hedge</Text>
              <ArrowRight size={16} color={colors.textDark} strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              activeOpacity={0.7}
              onPress={loadDemoTestingPreset}
            >
              <Text style={styles.presetButtonText}>
                ⚡ Load Verified Testnet Position (Judges)
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.positionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dual-Leg Capital Allocation</Text>
              <View style={styles.proofBadge}>
                <Lock size={10} color={colors.lime} strokeWidth={2.4} />
                <Text style={styles.proofBadgeText}>CarryLedger Audited</Text>
              </View>
            </View>

            {/* Asset Rows Container */}
            <View style={styles.assetListCard}>
              {/* Row 1: Kuru Spot Long */}
              <TouchableOpacity
                style={styles.assetRow}
                activeOpacity={0.75}
                onPress={() => setActiveTab("spot")}
              >
                <View style={styles.assetAvatar}>
                  <KuruLogo size={32} />
                </View>
                <View style={styles.assetMeta}>
                  <Text style={styles.assetName}>MON Spot Long</Text>
                  <Text style={styles.assetVenue}>Kuru CLOB</Text>
                </View>
                <View style={styles.assetValueGroup}>
                  <Text style={styles.assetDollarValue}>
                    ${(activePosition.spotQuantity * activePosition.spotPrice).toFixed(2)}
                  </Text>
                  <Text style={styles.assetCryptoAmount}>
                    {activePosition.spotQuantity.toFixed(1)} MON
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              {/* Row 2: Perpl 1x Short */}
              <TouchableOpacity
                style={styles.assetRow}
                activeOpacity={0.75}
                onPress={() => openRiskGuardModal(true)}
              >
                <View style={styles.assetAvatar}>
                  <PerplLogo size={32} />
                </View>
                <View style={styles.assetMeta}>
                  <Text style={styles.assetName}>MON Perp 1x Short</Text>
                  <Text style={styles.assetVenue}>Perpl Market 64</Text>
                </View>
                <View style={styles.assetValueGroup}>
                  <Text style={styles.assetDollarValue}>
                    ${(activePosition.perpQuantity * activePosition.perpMarkPrice).toFixed(2)}
                  </Text>
                  <Text style={styles.assetCryptoAmount}>
                    -{activePosition.perpQuantity.toFixed(1)} MON
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              {/* Row 3: 10% Reserve Buffer */}
              <View style={styles.assetRow}>
                <View style={styles.assetAvatar}>
                  <AusdLogo size={32} />
                </View>
                <View style={styles.assetMeta}>
                  <Text style={styles.assetName}>Reserve Buffer (10%)</Text>
                  <Text style={styles.assetVenue}>
                    Margin: {(activePosition.marginRatio * 100).toFixed(0)}% · Tier Normal
                  </Text>
                </View>
                <View style={styles.assetValueGroup}>
                  <Text style={[styles.assetDollarValue, { color: colors.lime }]}>
                    ${activePosition.reserveBuffer.toFixed(2)}
                  </Text>
                  <Text style={styles.assetCryptoAmount}>Liquid AUSD</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Live RPC, WebSocket & Block Status Strip */}
        <View style={styles.telemetryStrip}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isWsConnected ? colors.lime : colors.amber,
              marginRight: 4,
            }}
          />
          <Activity size={12} color={colors.textTertiary} strokeWidth={2} />
          <Text style={styles.telemetryText}>
            {isWsConnected ? "WS Live" : "Polling"} · Block #{blockNumber} · RPC {rpcLatencyMs}ms · Chain 10143
          </Text>
        </View>

        {/* Bottom Spacer */}
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
    paddingHorizontal: space.lg,
    paddingTop: Platform.OS === "android" ? 36 : space.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.lg,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  walletIconBox: {
    marginRight: 6,
  },
  walletAddress: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber,
    marginRight: 6,
  },
  networkDotLive: {
    backgroundColor: colors.lime,
  },
  networkName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  portfolioHero: {
    alignItems: "center",
    marginVertical: space.md,
  },
  portfolioLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: space.xs,
  },
  heroBalance: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  heroCurrency: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xs,
  },
  aprChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  aprText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
  },
  deltaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  deltaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  deltaDotActive: {
    backgroundColor: colors.lime,
  },
  deltaDotIdle: {
    backgroundColor: colors.textTertiary,
  },
  deltaText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: space.xl,
    paddingHorizontal: space.sm,
  },
  actionItem: {
    alignItems: "center",
    width: 68,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCircleActive: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  actionCircleDisabled: {
    opacity: 0.35,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  actionLabelActive: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  actionLabelCritical: {
    color: colors.crimson,
    fontWeight: "600",
  },
  emptyStateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.xl,
    alignItems: "center",
  },
  emptyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: space.sm,
  },
  emptyCtaButton: {
    backgroundColor: colors.lime,
    height: 46,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginTop: space.lg,
  },
  emptyCtaText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "700",
  },
  presetButton: {
    marginTop: space.md,
  },
  presetButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  positionsSection: {
    gap: space.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: space.xs,
    marginBottom: space.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  proofBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  proofBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.lime,
  },
  assetListCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  assetAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.md,
  },
  assetAvatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  assetMeta: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  assetVenue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  assetValueGroup: {
    alignItems: "flex-end",
  },
  assetDollarValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  assetCryptoAmount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hairlineDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginLeft: 56,
  },
  telemetryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: space.xl,
  },
  telemetryText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
});
