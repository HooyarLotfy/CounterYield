import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

const MOCK_ASKS: OrderBookLevel[] = [
  { price: 10.05, size: 450, total: 4522.5 },
  { price: 10.04, size: 280, total: 2811.2 },
  { price: 10.03, size: 120, total: 1203.6 },
  { price: 10.02, size: 85, total: 851.7 },
  { price: 10.01, size: 60, total: 600.6 },
];

const MOCK_BIDS: OrderBookLevel[] = [
  { price: 9.99, size: 90, total: 899.1 },
  { price: 9.98, size: 140, total: 1397.2 },
  { price: 9.97, size: 310, total: 3090.7 },
  { price: 9.96, size: 520, total: 5179.2 },
  { price: 9.95, size: 680, total: 6766.0 },
];

export const SpotScreen: React.FC = () => {
  const [tradeSide, setTradeSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState<string>("50");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Kuru Spot CLOB</Text>
          <View style={styles.pairBadge}>
            <Text style={styles.pairBadgeText}>MON / AUSD</Text>
          </View>
        </View>
        <Text style={styles.screenSubtitle}>
          Direct onchain central limit order book execution
        </Text>

        {/* Live Mid Price Banner */}
        <View style={styles.midPriceCard}>
          <Text style={styles.midPriceLabel}>Live Mid-Price</Text>
          <Text style={styles.midPriceValue}>$10.005 AUSD</Text>
          <Text style={styles.spreadLabel}>Spread: 0.02% (Tight Liquidity)</Text>
        </View>

        {/* Order Book Visualizer */}
        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <Text style={styles.colHeader}>Price (AUSD)</Text>
            <Text style={styles.colHeader}>Size (MON)</Text>
            <Text style={styles.colHeaderRight}>Total (AUSD)</Text>
          </View>

          {/* Asks (Red) */}
          {MOCK_ASKS.map((ask, i) => (
            <View key={`ask-${i}`} style={styles.bookRow}>
              <Text style={styles.askPrice}>${ask.price.toFixed(2)}</Text>
              <Text style={styles.bookSize}>{ask.size}</Text>
              <Text style={styles.bookTotal}>${ask.total.toFixed(1)}</Text>
            </View>
          ))}

          <View style={styles.spreadDivider}>
            <Text style={styles.spreadDividerText}>───── Kuru CLOB Spread ─────</Text>
          </View>

          {/* Bids (Green) */}
          {MOCK_BIDS.map((bid, i) => (
            <View key={`bid-${i}`} style={styles.bookRow}>
              <Text style={styles.bidPrice}>${bid.price.toFixed(2)}</Text>
              <Text style={styles.bookSize}>{bid.size}</Text>
              <Text style={styles.bookTotal}>${bid.total.toFixed(1)}</Text>
            </View>
          ))}
        </View>

        {/* Direct Trade Panel */}
        <View style={styles.tradeCard}>
          <View style={styles.tabToggleRow}>
            <TouchableOpacity
              style={[
                styles.tabToggle,
                tradeSide === "BUY" && styles.tabToggleActiveBuy,
              ]}
              onPress={() => setTradeSide("BUY")}
            >
              <Text
                style={[
                  styles.tabToggleText,
                  tradeSide === "BUY" && styles.tabToggleTextActive,
                ]}
              >
                Market Buy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabToggle,
                tradeSide === "SELL" && styles.tabToggleActiveSell,
              ]}
              onPress={() => setTradeSide("SELL")}
            >
              <Text
                style={[
                  styles.tabToggleText,
                  tradeSide === "SELL" && styles.tabToggleTextActive,
                ]}
              >
                Market Sell
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.tradeInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputCurrency}>MON</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.executeButton,
              tradeSide === "BUY"
                ? styles.executeButtonBuy
                : styles.executeButtonSell,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.executeButtonText}>
              Execute {tradeSide === "BUY" ? "Spot Buy" : "Spot Sell"} (Kuru CLOB)
            </Text>
          </TouchableOpacity>
        </View>

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  pairBadge: {
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.3)",
  },
  pairBadgeText: {
    color: "#CCFF00",
    fontSize: 12,
    fontWeight: "700",
  },
  screenSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 16,
  },
  midPriceCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  midPriceLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  midPriceValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  spreadLabel: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  bookCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2638",
    paddingBottom: 6,
  },
  colHeader: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  colHeaderRight: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  bookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  askPrice: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  bidPrice: {
    color: "#CCFF00",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  bookSize: {
    color: "#E2E8F0",
    fontSize: 12,
    flex: 1,
  },
  bookTotal: {
    color: "#94A3B8",
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  spreadDivider: {
    alignItems: "center",
    paddingVertical: 8,
  },
  spreadDividerText: {
    color: "#64748B",
    fontSize: 10,
  },
  tradeCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 18,
    padding: 16,
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: "#181E2C",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabToggle: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabToggleActiveBuy: {
    backgroundColor: "#CCFF00",
  },
  tabToggleActiveSell: {
    backgroundColor: "#FF3B30",
  },
  tabToggleText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  tabToggleTextActive: {
    color: "#0A0D14",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181E2C",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  tradeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  inputCurrency: {
    color: "#CCFF00",
    fontSize: 14,
    fontWeight: "700",
  },
  executeButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  executeButtonBuy: {
    backgroundColor: "#CCFF00",
  },
  executeButtonSell: {
    backgroundColor: "#FF3B30",
  },
  executeButtonText: {
    color: "#0A0D14",
    fontSize: 14,
    fontWeight: "800",
  },
});
