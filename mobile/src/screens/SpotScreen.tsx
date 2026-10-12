import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useKuruBook } from "../state/hooks/useKuruBook";
import { colors, radius, space } from "../theme";

export const SpotScreen: React.FC = () => {
  const { bids, asks, mid, spreadBps, isLoading } = useKuruBook();
  const [tradeSide, setTradeSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState<string>("50");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const estimatedCost = (numericAmount * mid).toFixed(2);

  const handleExecuteTrade = () => {
    setTxStatus("SUBMITTING");
    setTimeout(() => {
      setTxStatus("CONFIRMED");
      setTimeout(() => setTxStatus(null), 3000);
    }, 800);
  };

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
          <Text style={styles.midPriceValue}>${mid.toFixed(3)} AUSD</Text>
          <Text style={styles.spreadLabel}>Spread: {(spreadBps / 100).toFixed(2)}% (Tight Liquidity)</Text>
        </View>

        {/* Order Book Visualizer */}
        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <Text style={styles.colHeader}>Price (AUSD)</Text>
            <Text style={styles.colHeader}>Size (MON)</Text>
            <Text style={styles.colHeaderRight}>Total (AUSD)</Text>
          </View>

          {/* Asks (Red) */}
          {asks.slice(0, 5).map((ask, i) => (
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
          {bids.slice(0, 5).map((bid, i) => (
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

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Estimated Settlement</Text>
            <Text style={styles.calcValue}>${estimatedCost} AUSD</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Venue Router</Text>
            <Text style={styles.venueText}>Kuru Router (0x7EFbE1...4630)</Text>
          </View>

          {txStatus === "CONFIRMED" ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ Fill Confirmed on Monad Testnet</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.executeButton,
              tradeSide === "BUY" ? styles.executeBuy : styles.executeSell,
            ]}
            activeOpacity={0.85}
            disabled={txStatus === "SUBMITTING"}
            onPress={handleExecuteTrade}
          >
            {txStatus === "SUBMITTING" ? (
              <ActivityIndicator color={tradeSide === "BUY" ? "#0A0D14" : "#FFFFFF"} />
            ) : (
              <Text
                style={[
                  styles.executeButtonText,
                  tradeSide === "BUY" ? styles.textDark : styles.textLight,
                ]}
              >
                {tradeSide === "BUY" ? "Place Market Buy" : "Place Market Sell"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  pairBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pairBadgeText: {
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
  midPriceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: "center",
    marginBottom: space.md,
  },
  midPriceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  midPriceValue: {
    color: colors.snow,
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 4,
  },
  spreadLabel: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "600",
  },
  bookCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  colHeader: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  colHeaderRight: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  bookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  askPrice: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  bidPrice: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  bookSize: {
    color: colors.text,
    fontSize: 12,
    textAlign: "center",
    flex: 1,
  },
  bookTotal: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  spreadDivider: {
    alignItems: "center",
    paddingVertical: 6,
  },
  spreadDividerText: {
    color: colors.border,
    fontSize: 10,
    fontWeight: "700",
  },
  tradeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.lg,
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceHi,
    borderRadius: radius.sm,
    padding: 4,
    marginBottom: space.md,
  },
  tabToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm - 2,
  },
  tabToggleActiveBuy: {
    backgroundColor: colors.lime,
  },
  tabToggleActiveSell: {
    backgroundColor: colors.crimson,
  },
  tabToggleText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  tabToggleTextActive: {
    color: colors.bg,
    fontWeight: "800",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    marginBottom: space.md,
  },
  tradeInput: {
    flex: 1,
    color: colors.snow,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 12,
  },
  inputCurrency: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.xs + 2,
  },
  calcLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  calcValue: {
    color: colors.snow,
    fontSize: 13,
    fontWeight: "700",
  },
  venueText: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: "500",
  },
  successBanner: {
    backgroundColor: colors.limeSoft,
    borderWidth: 1,
    borderColor: colors.limeLine,
    padding: space.sm,
    borderRadius: radius.sm,
    marginTop: space.sm,
  },
  successText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  executeButton: {
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: space.md,
  },
  executeBuy: {
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  executeSell: {
    backgroundColor: colors.crimson,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  executeButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  textDark: {
    color: colors.bg,
  },
  textLight: {
    color: colors.snow,
  },
});
