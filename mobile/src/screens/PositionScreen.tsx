import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { usePosition } from "../state/hooks/usePosition";
import { colors, radius, space } from "../theme";

export const PositionScreen: React.FC = () => {
  const { position, openUnwindModal, openRiskGuardModal } = usePosition();

  const marginRatio = position?.marginRatio ?? 0.92;
  const currentTier = position?.tier ?? "NORMAL";
  const distanceToLiq = position?.distanceToLiquidationPercent ?? 78.4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button & Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => openRiskGuardModal(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerBadgeText}>Defense Active</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Position & Risk Guard</Text>
        <Text style={styles.screenSubtitle}>
          Real-time margin defense & liquidation immunity monitor
        </Text>

        {/* Distance to Liquidation Gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeLabel}>Distance to Liquidation</Text>
          <Text style={styles.gaugePercent}>{distanceToLiq}%</Text>
          <Text style={styles.gaugeStatus}>Safe Zone (No Liquidation Threat)</Text>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, distanceToLiq))}%` },
              ]}
            />
          </View>
        </View>

        {/* 3-Tier Risk Guard Ladder */}
        <Text style={styles.sectionHeader}>3-Tier Defense Escalation Ladder</Text>

        {/* Tier 1 */}
        <View
          style={[
            styles.tierCard,
            currentTier === "NORMAL" || currentTier === "TIER_1_TOPUP"
              ? styles.tierCardActiveGreen
              : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillGreen}>
              <Text style={styles.tierPillText}>TIER 1 | TOP-UP</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin Ratio: 60% - 40%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Draws unencumbered AUSD from 10% reserve buffer to top up Perpl short margin.
            Preserves 100% position size.
          </Text>
        </View>

        {/* Tier 2 */}
        <View
          style={[
            styles.tierCard,
            currentTier === "TIER_2_DELEVERAGE" ? styles.tierCardActiveAmber : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillAmber}>
              <Text style={styles.tierPillText}>TIER 2 | DELEVERAGE</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin Ratio: 40% - 25%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Reserve depleted. Automatically deleverages 20% of spot MON on Kuru and closes 20%
            of Perpl short. Restores 100% margin buffer.
          </Text>
        </View>

        {/* Tier 3 */}
        <View
          style={[
            styles.tierCard,
            currentTier === "TIER_3_EMERGENCY" ? styles.tierCardActiveCrimson : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillCrimson}>
              <Text style={styles.tierPillText}>TIER 3 | EMERGENCY UNWIND</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin Ratio: &lt; 25%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Requires 2 consecutive blocks below 25%. Fully unwinds 100% of remaining position to
            AUSD before exchange liquidation occurs. Zero debt.
          </Text>
        </View>

        {/* Manual 1-Tap Unwind Action */}
        <TouchableOpacity
          style={styles.unwindButton}
          activeOpacity={0.85}
          onPress={() => openUnwindModal(true)}
        >
          <Text style={styles.unwindButtonText}>Initiate 1-Tap Unwind</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: space.xl,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.md,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.lime,
    fontSize: 13,
    fontWeight: "700",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.limeSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.limeLine,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: 6,
  },
  headerBadgeText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
  },
  screenTitle: {
    color: colors.snow,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: space.lg,
  },
  gaugeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: "center",
    marginBottom: space.xl,
  },
  gaugeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gaugePercent: {
    color: colors.lime,
    fontSize: 48,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: -1,
  },
  gaugeStatus: {
    color: colors.snow,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 16,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceHi,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: 4,
  },
  sectionHeader: {
    color: colors.snow,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: space.md,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.lg,
    marginBottom: space.md,
  },
  tierCardActiveGreen: {
    borderColor: colors.limeLine,
    backgroundColor: colors.limeSoft,
  },
  tierCardActiveAmber: {
    borderColor: "rgba(255, 176, 32, 0.5)",
    backgroundColor: "rgba(255, 176, 32, 0.05)",
  },
  tierCardActiveCrimson: {
    borderColor: "rgba(255, 59, 48, 0.5)",
    backgroundColor: "rgba(255, 59, 48, 0.05)",
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  tierPillGreen: {
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.limeLine,
  },
  tierPillAmber: {
    backgroundColor: "rgba(255, 176, 32, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierPillCrimson: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierPillText: {
    color: colors.snow,
    fontSize: 10,
    fontWeight: "700",
  },
  tierRatioText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  tierDesc: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  unwindButton: {
    backgroundColor: colors.crimson,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: "center",
    marginTop: space.md,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  unwindButtonText: {
    color: colors.snow,
    fontSize: 15,
    fontWeight: "800",
  },
});
