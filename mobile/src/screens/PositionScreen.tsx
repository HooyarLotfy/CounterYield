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

export const PositionScreen: React.FC = () => {
  const { activePosition, openUnwindModal } = useAppStore();

  const marginRatio = activePosition?.marginRatio ?? 0.92;
  const currentTier = activePosition?.tier ?? "NORMAL";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Position & Risk Guard</Text>
        <Text style={styles.screenSubtitle}>
          Real-time margin defense & liquidation immunity monitor
        </Text>

        {/* Distance to Liquidation Gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeLabel}>Distance to Liquidation</Text>
          <Text style={styles.gaugePercent}>
            {activePosition?.distanceToLiquidationPercent ?? 78.4}%
          </Text>
          <Text style={styles.gaugeStatus}>Safe Zone (No Liquidation Threat)</Text>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${activePosition?.distanceToLiquidationPercent ?? 78.4}%` },
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
              <Text style={styles.tierPillText}>TIER 2 | PROPORTIONAL DELEVERAGE</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin Ratio: 40% - 25%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Shrinks both spot and perp short legs proportionally to restore 100% margin
            ratio. Completely eliminates naked-short drift risk.
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
            Triggered across 2 consecutive blocks. Closes Perpl short with reduce-only
            market buy, liquidates Kuru spot, and locks 100% AUSD.
          </Text>
        </View>

        {/* Emergency 1-Tap Unwind Button */}
        <TouchableOpacity
          style={styles.unwindButton}
          activeOpacity={0.85}
          onPress={() => openUnwindModal(true)}
        >
          <Text style={styles.unwindButtonText}>🔒 Guaranteed 1-Tap Unwind</Text>
        </TouchableOpacity>

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
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  screenSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  gaugeLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  gaugePercent: {
    color: "#CCFF00",
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
  },
  gaugeStatus: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#181E2C",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#CCFF00",
    borderRadius: 4,
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  tierCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tierCardActiveGreen: {
    borderColor: "rgba(204, 255, 0, 0.4)",
    backgroundColor: "rgba(204, 255, 0, 0.04)",
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
    marginBottom: 8,
  },
  tierPillGreen: {
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  tierRatioText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  tierDesc: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
  },
  unwindButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  unwindButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
