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
  Clock,
  ExternalLink,
  Shield,
  Zap,
  RotateCcw,
  RefreshCw,
} from "lucide-react-native";

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
                <RefreshCw size={13} color={colors.lime} />
                <Text style={styles.refreshText}>Sync</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.screenSubtitle}>
          Envio HyperIndex real-time GraphQL audit log on Monad Testnet.
        </Text>

        {activities.map((act) => {
          const isGuard = act.type === "GUARD_EVENT";
          const isHedge = act.type === "OPEN_HEDGE";

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
                    isGuard ? styles.pillAmber : isHedge ? styles.pillLime : styles.pillDefault,
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
                    {act.txHash.slice(0, 6)}...{act.txHash.slice(-4)}
                  </Text>
                  <ExternalLink size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  refreshButton: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
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
    fontSize: 11.5,
    fontWeight: "700",
    marginLeft: 6,
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 18,
  },
  activityCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  pillLime: {
    backgroundColor: colors.lime,
  },
  pillAmber: {
    backgroundColor: colors.amberSoft,
  },
  pillDefault: {
    backgroundColor: colors.glassFillLight,
  },
  typeText: {
    fontSize: 10.5,
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
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
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
    color: colors.textSecondary,
    fontSize: 11.5,
  },
});
