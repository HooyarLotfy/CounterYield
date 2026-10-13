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
import { usePosition } from "../state/hooks/usePosition";
import { useAppStore } from "../state/store";
import { colors, radius, space } from "../theme";
import {
  Shield,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
} from "lucide-react-native";

export const PositionScreen: React.FC = () => {
  const { position, openUnwindModal, openRiskGuardModal } = usePosition();
  const { setActiveTab } = useAppStore();

  const hasActivePosition = Boolean(
    position && position.state === "ACTIVE" && (position.depositAmount || 0) > 0
  );

  const currentTier = position?.tier ?? "NORMAL";

  // Real Distance-to-Liquidation formula from Metropolis specification:
  // Short Perp liquidation triggers when loss depletes margin down to MMR (5%).
  // P_liq = ( (PerpMargin + ReserveBuffer) / BaseQty + EntryPrice ) / (1 + MMR)
  // Distance (%) = ((P_liq - MarkPrice) / MarkPrice) * 100
  let distanceToLiq = 0;
  let liqPriceFormatted = "N/A";

  if (hasActivePosition && position) {
    const entryPrice = position.perpMarkPrice || position.spotPrice || 0;
    const markPrice = position.perpMarkPrice > 0 ? position.perpMarkPrice : entryPrice;
    const qty = position.perpQuantity || position.spotQuantity || 0;
    const perpMargin =
      ((position.depositAmount || 0) - (position.reserveBuffer || 0)) / 2;
    const reserveBuffer = position.reserveBuffer || 0;
    const totalEffectiveMargin = perpMargin + reserveBuffer;
    const mmr = 0.05; // 5% maintenance margin requirement on Perpl

    if (qty > 0 && markPrice > 0 && entryPrice > 0) {
      const liqPrice = (totalEffectiveMargin / qty + entryPrice) / (1 + mmr);
      distanceToLiq = ((liqPrice - markPrice) / markPrice) * 100;
      liqPriceFormatted = `$${liqPrice.toFixed(4)}`;
    } else if (position.distanceToLiquidationPercent) {
      distanceToLiq = position.distanceToLiquidationPercent;
      liqPriceFormatted = `$${(markPrice * (1 + distanceToLiq / 100)).toFixed(4)}`;
    }
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => openRiskGuardModal(false)}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}>Close</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, !hasActivePosition && styles.statusBadgeIdle]}>
            <View style={[styles.statusDot, !hasActivePosition && styles.statusDotIdle]} />
            <Text style={[styles.statusText, !hasActivePosition && styles.statusTextIdle]}>
              {hasActivePosition ? "Defense Active" : "Standby"}
            </Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Risk Guard Monitor</Text>
        <Text style={styles.screenSubtitle}>
          Real-time margin defense & liquidation immunity powered by Monad's 1-second blocks.
        </Text>

        {/* Distance to Liquidation Gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeLabel}>Distance to Exchange Liquidation</Text>
          {hasActivePosition ? (
            <>
              <Text style={styles.gaugePercent}>+{distanceToLiq.toFixed(1)}%</Text>
              <Text style={styles.gaugeStatus}>
                Safe Zone · Liq Price: {liqPriceFormatted} · MMR: 5.0%
              </Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, Math.max(0, distanceToLiq))}%` },
                  ]}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.gaugePercent, styles.gaugePercentIdle]}>Vault Idle</Text>
              <Text style={styles.gaugeStatus}>
                No Open Position · Risk Guard in Standby
              </Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: "0%" }]} />
              </View>
            </>
          )}
        </View>

        {/* 3-Tier Risk Guard Ladder */}
        <Text style={styles.sectionHeader}>3-Tier Defense Escalation Ladder</Text>

        {/* Tier 1 */}
        <View
          style={[
            styles.tierCard,
            hasActivePosition &&
            (currentTier === "NORMAL" || currentTier === "TIER_1_TOPUP")
              ? styles.tierCardActiveGreen
              : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillGreen}>
              <Text style={styles.tierPillText}>TIER 1 | RESERVE TOP-UP</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin: 60% - 40%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Draws unencumbered AUSD from the 10% reserve buffer to top up Perpl short margin.
            Preserves 100% position size without selling spot.
          </Text>
        </View>

        {/* Tier 2 */}
        <View
          style={[
            styles.tierCard,
            hasActivePosition && currentTier === "TIER_2_DELEVERAGE"
              ? styles.tierCardActiveAmber
              : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillAmber}>
              <Text style={styles.tierPillText}>TIER 2 | DELEVERAGE</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin: 40% - 25%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Reserve buffer depleted. Automatically deleverages 20% of spot MON on Kuru and closes
            20% short on Perpl to return margin ratio back to 100%.
          </Text>
        </View>

        {/* Tier 3 */}
        <View
          style={[
            styles.tierCard,
            hasActivePosition && currentTier === "TIER_3_EMERGENCY"
              ? styles.tierCardActiveRed
              : null,
          ]}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierPillRed}>
              <Text style={styles.tierPillText}>TIER 3 | EMERGENCY UNWIND</Text>
            </View>
            <Text style={styles.tierRatioText}>Margin: &lt; 25%</Text>
          </View>
          <Text style={styles.tierDesc}>
            Severe market shock. Concurrently executes Kuru spot market sell and Perpl market short close
            over 2 consecutive blocks. Reverts 100% of capital to safe AUSD.
          </Text>
        </View>

        {/* Action Button */}
        {hasActivePosition ? (
          <TouchableOpacity
            style={styles.unwindBtn}
            activeOpacity={0.85}
            onPress={() => {
              openRiskGuardModal(false);
              openUnwindModal(true);
            }}
          >
            <Text style={styles.unwindBtnText}>Execute 1-Tap Unwind</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.depositCtaBtn}
            activeOpacity={0.85}
            onPress={() => {
              openRiskGuardModal(false);
              setActiveTab("earn");
            }}
          >
            <Zap size={16} color={colors.textDark} strokeWidth={2.4} />
            <Text style={styles.depositCtaBtnText}>Open Delta-Neutral Carry</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.limeMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: 6,
  },
  statusText: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "700",
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  gaugeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  gaugePercent: {
    color: colors.lime,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
  },
  gaugeStatus: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 16,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceInput,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.lime,
    borderRadius: 4,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  tierCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
  },
  tierCardActiveGreen: {
    borderColor: "rgba(204, 255, 0, 0.4)",
    backgroundColor: "rgba(204, 255, 0, 0.04)",
  },
  tierCardActiveAmber: {
    borderColor: "rgba(255, 159, 10, 0.4)",
    backgroundColor: "rgba(255, 159, 10, 0.04)",
  },
  tierCardActiveRed: {
    borderColor: "rgba(255, 69, 58, 0.4)",
    backgroundColor: "rgba(255, 69, 58, 0.04)",
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tierPillGreen: {
    backgroundColor: colors.limeMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  tierPillAmber: {
    backgroundColor: colors.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  tierPillRed: {
    backgroundColor: colors.crimsonSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  tierPillText: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontWeight: "700",
  },
  tierRatioText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  tierDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  unwindBtn: {
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  unwindBtnText: {
    color: colors.crimson,
    fontSize: 14,
    fontWeight: "700",
  },
  statusBadgeIdle: {
    backgroundColor: colors.surfaceInput,
  },
  statusDotIdle: {
    backgroundColor: colors.textTertiary,
  },
  statusTextIdle: {
    color: colors.textSecondary,
  },
  gaugePercentIdle: {
    color: colors.textSecondary,
    fontSize: 32,
  },
  depositCtaBtn: {
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    marginTop: 14,
  },
  depositCtaBtnText: {
    color: colors.textDark,
    fontSize: 14.5,
    fontWeight: "700",
  },
});
