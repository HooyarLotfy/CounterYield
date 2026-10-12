import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";

interface ActivityItem {
  id: string;
  type: "OPEN_HEDGE" | "REBALANCE" | "FUNDING_ACCRUED" | "GUARD_EVENT" | "UNWIND";
  title: string;
  timestamp: string;
  amount: string;
  txHash: string;
  isPositive: boolean;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "FUNDING_ACCRUED",
    title: "Hourly Funding Payment Accrued",
    timestamp: "12 mins ago",
    amount: "+$0.85 AUSD",
    txHash: "0x3e18a902bf81...",
    isPositive: true,
  },
  {
    id: "act-2",
    type: "GUARD_EVENT",
    title: "Risk Guard Check: Normal (Tier 0)",
    timestamp: "1 hour ago",
    amount: "Margin: 92.4%",
    txHash: "0x89dc2410fc33...",
    isPositive: true,
  },
  {
    id: "act-3",
    type: "OPEN_HEDGE",
    title: "Dual-Leg Hedge Opened (Kuru Spot + Perpl Short)",
    timestamp: "4 hours ago",
    amount: "$1,000.00 AUSD",
    txHash: "0x12dc55a004eb...",
    isPositive: false,
  },
];

export const ActivityScreen: React.FC = () => {
  const handleOpenExplorer = (txHash: string) => {
    Linking.openURL(`https://testnet.monadscan.com/tx/${txHash}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Onchain Activity Log</Text>
        <Text style={styles.screenSubtitle}>
          Real-time Envio HyperIndex GraphQL audit stream
        </Text>

        {MOCK_ACTIVITIES.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={styles.activityCard}
            activeOpacity={0.8}
            onPress={() => handleOpenExplorer(act.txHash)}
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityTypePill}>
                <Text style={styles.activityTypeText}>{act.type}</Text>
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
                <Text style={styles.txHashText}>Tx: {act.txHash}</Text>
                <Text style={styles.arrowIcon}>↗</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

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
  activityCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activityTypePill: {
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityTypeText: {
    color: "#CCFF00",
    fontSize: 10,
    fontWeight: "700",
  },
  timestampText: {
    color: "#64748B",
    fontSize: 11,
  },
  activityTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 10,
  },
  amountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  amountPositive: {
    color: "#CCFF00",
  },
  amountNeutral: {
    color: "#E2E8F0",
  },
  txHashRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  txHashText: {
    color: "#94A3B8",
    fontSize: 11,
    marginRight: 4,
  },
  arrowIcon: {
    color: "#CCFF00",
    fontSize: 12,
    fontWeight: "700",
  },
});
