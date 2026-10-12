import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useAppStore } from "../state/store";

export const HomeScreen: React.FC = () => {
  const {
    walletBalanceAusd,
    activePosition,
    setActiveTab,
    openUnwindModal,
    openRiskGuardModal,
  } = useAppStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.avatarPill}>
            <Text style={styles.shieldIcon}>🛡</Text>
            <Text style={styles.addressText}>0x742d...f44e</Text>
          </View>
          <View style={styles.networkBadge}>
            <View style={styles.networkDot} />
            <Text style={styles.networkText}>Monad Testnet (10143)</Text>
          </View>
        </View>

        {/* Monumental Earning Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Earning Balance</Text>
          <Text style={styles.heroBalance}>
            ${walletBalanceAusd.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
            <Text style={styles.currencyCode}>AUSD</Text>
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.deltaNeutralBadge}>
              <View style={styles.pulseGreenDot} />
              <Text style={styles.deltaNeutralText}>
                Delta Neutral Δ = ${activePosition?.netDeltaDollars.toFixed(2) ?? "0.00"}{" "}
                (Safe)
              </Text>
            </View>
            <View style={styles.aprBadge}>
              <Text style={styles.aprText}>
                +{( (activePosition?.estimatedApr ?? 0.184) * 100 ).toFixed(1)}% APY
              </Text>
              <Text style={styles.aprSubtext}>Live Funding</Text>
            </View>
          </View>
        </View>

        {/* Circular Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={() => setActiveTab("earn")}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionSymbol}>↓</Text>
            </View>
            <Text style={styles.actionLabel}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={() => setActiveTab("earn")}
          >
            <View style={[styles.actionIconContainer, styles.actionPrimary]}>
              <Text style={[styles.actionSymbol, styles.actionPrimaryText]}>⚡</Text>
            </View>
            <Text style={styles.actionLabel}>Start Earning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={() => openRiskGuardModal(true)}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionSymbol}>🛡</Text>
            </View>
            <Text style={styles.actionLabel}>Risk Guard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={() => openUnwindModal(true)}
          >
            <View style={[styles.actionIconContainer, styles.actionAlarm]}>
              <Text style={[styles.actionSymbol, styles.actionAlarmText]}>✕</Text>
            </View>
            <Text style={styles.actionLabel}>1-Tap Unwind</Text>
          </TouchableOpacity>
        </View>

        {/* Dual-Leg Status Cards */}
        <Text style={styles.sectionTitle}>Dual-Leg Capital Allocation</Text>

        <TouchableOpacity
          style={styles.legCard}
          activeOpacity={0.8}
          onPress={() => setActiveTab("spot")}
        >
          <View style={styles.legHeader}>
            <View style={styles.legTitleGroup}>
              <View style={styles.legIndicatorGreen} />
              <Text style={styles.legTitle}>Leg 1: Kuru Spot MON (Long)</Text>
            </View>
            <Text style={styles.venueBadge}>Kuru CLOB</Text>
          </View>
          <View style={styles.legStatsRow}>
            <View>
              <Text style={styles.statLabel}>Size</Text>
              <Text style={styles.statValue}>
                {activePosition?.spotQuantity ?? 45.0} MON ($450.00)
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Entry Price</Text>
              <Text style={styles.statValue}>
                ${activePosition?.spotPrice ?? 10.0} AUSD
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Type</Text>
              <Text style={styles.statValuePositive}>100% Spot</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legCard}
          activeOpacity={0.8}
          onPress={() => openRiskGuardModal(true)}
        >
          <View style={styles.legHeader}>
            <View style={styles.legTitleGroup}>
              <View style={styles.legIndicatorPurple} />
              <Text style={styles.legTitle}>Leg 2: Perpl MON Perp (1x Short)</Text>
            </View>
            <Text style={styles.venueBadge}>Perpl DEX</Text>
          </View>
          <View style={styles.legStatsRow}>
            <View>
              <Text style={styles.statLabel}>Size</Text>
              <Text style={styles.statValue}>
                -{activePosition?.perpQuantity ?? 45.0} MON ($450.00)
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Margin Ratio</Text>
              <Text style={styles.statValueChartreuse}>
                {((activePosition?.marginRatio ?? 0.92) * 100).toFixed(1)}% (Tier: Normal)
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Funding Earned</Text>
              <Text style={styles.statValuePositive}>
                +${activePosition?.accruedFundingEst.toFixed(2) ?? "34.20"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom space for floating bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0D14",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shieldIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  addressText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFF00",
    marginRight: 6,
  },
  networkText: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  heroLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  heroBalance: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  currencyCode: {
    fontSize: 18,
    color: "#94A3B8",
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  deltaNeutralBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.4)",
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFF00",
    marginRight: 6,
  },
  deltaNeutralText: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "700",
  },
  aprBadge: {
    alignItems: "flex-end",
  },
  aprText: {
    color: "#CCFF00",
    fontSize: 16,
    fontWeight: "800",
  },
  aprSubtext: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  actionItem: {
    alignItems: "center",
    flex: 1,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionPrimary: {
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    borderColor: "#CCFF00",
  },
  actionPrimaryText: {
    color: "#CCFF00",
  },
  actionAlarm: {
    backgroundColor: "rgba(255, 59, 48, 0.12)",
    borderColor: "rgba(255, 59, 48, 0.4)",
  },
  actionAlarmText: {
    color: "#FF3B30",
  },
  actionSymbol: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  actionLabel: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  legCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  legHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  legTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  legIndicatorGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CCFF00",
    marginRight: 8,
  },
  legIndicatorPurple: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A855F7",
    marginRight: 8,
  },
  legTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  venueBadge: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#181E2C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  statValuePositive: {
    color: "#CCFF00",
    fontSize: 13,
    fontWeight: "700",
  },
  statValueChartreuse: {
    color: "#CCFF00",
    fontSize: 13,
    fontWeight: "700",
  },
});
