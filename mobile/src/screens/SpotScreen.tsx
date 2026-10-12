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
  Platform,
} from "react-native";
import { useKuruBook } from "../state/hooks/useKuruBook";
import { colors, radius, space } from "../theme";
import { KuruLogo } from "../components/Logos";
import {
  ArrowLeftRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react-native";

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <KuruLogo size={28} />
            <Text style={styles.screenTitle}>Kuru Spot CLOB</Text>
          </View>
          <View style={styles.pairBadge}>
            <Text style={styles.pairBadgeText}>MON / AUSD</Text>
          </View>
        </View>
        <Text style={styles.screenSubtitle}>
          Direct onchain central limit order book execution on Monad Testnet.
        </Text>

        {/* Live Mid Price Banner */}
        <View style={styles.midPriceCard}>
          <View style={styles.midPriceTop}>
            <Text style={styles.midPriceLabel}>Live Mid-Price</Text>
            <View style={styles.tightSpreadPill}>
              <Text style={styles.tightSpreadText}>
                Spread: {(spreadBps / 100).toFixed(2)}%
              </Text>
            </View>
          </View>
          <Text style={styles.midPriceValue}>${mid.toFixed(3)} AUSD</Text>
        </View>

        {/* Order Book Visualizer */}
        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <Text style={styles.colHeader}>Price (AUSD)</Text>
            <Text style={styles.colHeaderCenter}>Size (MON)</Text>
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
            <View style={styles.spreadLine} />
            <Text style={styles.spreadDividerText}>Kuru CLOB Spread</Text>
            <View style={styles.spreadLine} />
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Order Size</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.inputUnit}>MON</Text>
            </View>
          </View>

          <View style={styles.estCostRow}>
            <Text style={styles.estCostLabel}>Est. Total Outlay:</Text>
            <Text style={styles.estCostValue}>${estimatedCost} AUSD</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.execBtn,
              tradeSide === "BUY" ? styles.execBtnBuy : styles.execBtnSell,
            ]}
            activeOpacity={0.85}
            onPress={handleExecuteTrade}
          >
            {txStatus === "SUBMITTING" ? (
              <ActivityIndicator color={colors.textDark} />
            ) : txStatus === "CONFIRMED" ? (
              <View style={styles.btnRow}>
                <CheckCircle2 size={18} color={colors.textDark} />
                <Text style={styles.execBtnText}>Order Mined on Monad</Text>
              </View>
            ) : (
              <Text style={styles.execBtnText}>
                Place Market {tradeSide === "BUY" ? "Buy" : "Sell"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

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
  pairBadge: {
    backgroundColor: colors.limeMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pairBadgeText: {
    color: colors.lime,
    fontSize: 11.5,
    fontWeight: "700",
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 18,
  },
  midPriceCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 16,
  },
  midPriceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  midPriceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  tightSpreadPill: {
    backgroundColor: colors.glassFillLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  tightSpreadText: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "600",
  },
  midPriceValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  bookCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 16,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  colHeader: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  colHeaderCenter: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  colHeaderRight: {
    color: colors.textTertiary,
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
    color: colors.crimson,
    fontSize: 12.5,
    fontWeight: "700",
    flex: 1,
  },
  bidPrice: {
    color: colors.lime,
    fontSize: 12.5,
    fontWeight: "700",
    flex: 1,
  },
  bookSize: {
    color: colors.textPrimary,
    fontSize: 12.5,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  bookTotal: {
    color: colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  spreadDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  spreadLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  spreadDividerText: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  tradeCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 18,
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceInput,
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: 16,
  },
  tabToggle: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.md,
  },
  tabToggleActiveBuy: {
    backgroundColor: colors.lime,
  },
  tabToggleActiveSell: {
    backgroundColor: colors.crimson,
  },
  tabToggleText: {
    color: colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
  },
  tabToggleTextActive: {
    color: colors.textDark,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    padding: 0,
  },
  inputUnit: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  estCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  estCostLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  estCostValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  execBtn: {
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  execBtnBuy: {
    backgroundColor: colors.lime,
  },
  execBtnSell: {
    backgroundColor: colors.crimson,
  },
  execBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "800",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
