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
} from "react-native";
import { useActivity } from "../state/hooks/useActivity";
import { colors, radius, space } from "../theme";
import { config } from "../config/env";

export const ActivityScreen: React.FC = () => {
  const { activities, isLoading, refetch } = useActivity();

  const handleOpenExplorer = (txHash: string) => {
    const url = `${config.explorerUrl || "https://testnet.monadscan.com"}/tx/${txHash}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Onchain Activity Log</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refetch}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.lime} />
            ) : (
              <Text style={styles.refreshText}>↻ Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.screenSubtitle}>
          Real-time Envio HyperIndex GraphQL audit stream on Monad Testnet
        </Text>

        {activities.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={styles.activityCard}
            activeOpacity={0.8}
            onPress={() => handleOpenExplorer(act.txHash)}
          >
            <View style={styles.activityHeader}>
              <View
                style={[
                  styles.activityTypePill,
                  act.type === "GUARD_EVENT"
                    ? styles.pillAmber
                    : act.type === "OPEN_HEDGE"
                    ? styles.pillLime
                    : styles.pillDefault,
                ]}
              >
                <Text
                  style={[
                    styles.activityTypeText,
                    act.type === "OPEN_HEDGE" ? styles.textDark : styles.textLight,
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
                  Tx: {act.txHash.slice(0, 8)}...{act.txHash.slice(-6)}
                </Text>
                <Text style={styles.arrowIcon}>↗</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    color: colors.snow,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  refreshButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: space.lg,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillLime: {
    backgroundColor: colors.lime,
  },
  pillAmber: {
    backgroundColor: "rgba(255, 176, 32, 0.2)",
    borderWidth: 1,
    borderColor: colors.amber,
  },
  pillDefault: {
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityTypeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  textDark: {
    color: colors.bg,
  },
  textLight: {
    color: colors.snow,
  },
  timestampText: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "500",
  },
  activityTitle: {
    color: colors.snow,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  amountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  amountPositive: {
    color: colors.lime,
  },
  amountNeutral: {
    color: colors.muted,
  },
  txHashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  txHashText: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "500",
  },
  arrowIcon: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
  },
});
