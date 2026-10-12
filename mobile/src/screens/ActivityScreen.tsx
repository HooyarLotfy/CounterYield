import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useActivity } from "../state/hooks/useActivity";
import { colors, radius, space } from "../theme";
import { config } from "../config/env";
import {
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
  CheckCircle2,
} from "lucide-react-native";

export const ActivityScreen: React.FC = () => {
  const { activities, isLoading, refetch } = useActivity();

  const handleOpenExplorer = (txHash: string) => {
    const url = `${config.explorerUrl || "https://testnet.monadscan.com"}/tx/${txHash}`;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Onchain Activity</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refetch}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.lime} />
            ) : (
              <View style={styles.refreshRow}>
                <RefreshCw size={12} color={colors.lime} />
                <Text style={styles.refreshText}>Sync</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.screenSubtitle}>
          Live Monad Testnet audit log · Click any transaction to view on Monadscan.
        </Text>

        {activities.map((act) => {
          const isUnwind = act.type === "UNWIND";
          const isHedge = act.type === "OPEN_HEDGE";
          const isDeploy = act.type === "DEPLOY";

          return (
            <TouchableOpacity
              key={act.id}
              style={styles.activityCard}
              activeOpacity={0.8}
              onPress={() => handleOpenExplorer(act.txHash)}
            >
              <View style={styles.activityHeader}>
                <View
                  style={[
                    styles.typePill,
                    isUnwind
                      ? styles.pillCrimson
                      : isHedge
                      ? styles.pillLime
                      : isDeploy
                      ? styles.pillViolet
                      : styles.pillDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      isHedge ? styles.typeTextDark : styles.typeTextLight,
                    ]}
                  >
                    {act.type}
                  </Text>
                </View>
                <Text style={styles.timestampText}>{act.timestamp}</Text>
              </View>

              <Text style={styles.activityTitle}>{act.title}</Text>

              <View style={styles.activityFooter}>
                <Text
                  style={[
                    styles.amountText,
                    act.isPositive ? styles.amountPositive : styles.amountNeutral,
                  ]}
                >
                  {act.amount}
                </Text>

                <View style={styles.txHashRow}>
                  <Text style={styles.txHashText}>
                    {act.txHash.slice(0, 8)}...{act.txHash.slice(-6)}
                  </Text>
                  <ExternalLink size={12} color={colors.lime} style={{ marginLeft: 5 }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.xs,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  refreshButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshText: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: space.lg,
    lineHeight: 18,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  pillLime: {
    backgroundColor: colors.lime,
  },
  pillCrimson: {
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: colors.crimson,
  },
  pillViolet: {
    backgroundColor: colors.monadVioletSoft,
    borderWidth: 1,
    borderColor: colors.monadViolet,
  },
  pillDefault: {
    backgroundColor: colors.surfaceCardElevated,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  typeTextDark: {
    color: colors.textDark,
  },
  typeTextLight: {
    color: colors.textPrimary,
  },
  timestampText: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: space.sm,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  amountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  amountPositive: {
    color: colors.lime,
  },
  amountNeutral: {
    color: colors.textPrimary,
  },
  txHashRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  txHashText: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "600",
  },
});
