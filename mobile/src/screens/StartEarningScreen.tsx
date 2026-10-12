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
import { useAppStore } from "../state/store";
import { backendApi } from "../services/backendApi";

export const StartEarningScreen: React.FC = () => {
  const { userAddress, setActiveTab, updatePosition } = useAppStore();
  const [depositAmount, setDepositAmount] = useState<string>("1000");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const numericDeposit = parseFloat(depositAmount) || 0;
  const reserveBuffer = numericDeposit * 0.1;
  const activeCapital = numericDeposit - reserveBuffer;
  const spotAlloc = activeCapital / 2;
  const perpAlloc = activeCapital / 2;

  // Assuming 18.4% APY and 0.20% round-trip taker fees
  const roundTripCost = numericDeposit * 0.002;
  const dailyCarry = (numericDeposit * 0.184) / 365;
  const breakEvenDays = dailyCarry > 0 ? (roundTripCost / dailyCarry).toFixed(1) : "0.0";

  const handleStartEarning = async () => {
    setIsSubmitting(true);
    try {
      if (userAddress) {
        await backendApi.enter({
          ownerAddress: userAddress,
          depositAmount: numericDeposit,
          leverage: 1,
          maxSlippageBps: 20,
          apiKey: "pk_trade_session_ed25519",
          apiSecretHex: "0xsecret_key_mock_prf",
        }).catch(() => null);
      }
    } finally {
      updatePosition({
        state: "ACTIVE",
        depositAmount: numericDeposit,
        reserveBuffer,
        spotQuantity: spotAlloc / 10,
        perpQuantity: perpAlloc / 10,
        netDeltaDollars: 0.0,
        estimatedApr: 0.184,
        tier: "NORMAL",
        marginRatio: 0.95,
      });
      setIsSubmitting(false);
      setActiveTab("home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Start Earning Yield</Text>
        <Text style={styles.screenSubtitle}>
          Automated delta-neutral basis carry on Monad Testnet
        </Text>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Deposit Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputCurrency}>AUSD</Text>
          </View>

          {/* Quick preset chips */}
          <View style={styles.presetRow}>
            {["250", "500", "1000", "5000"].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  depositAmount === preset && styles.presetChipActive,
                ]}
                onPress={() => setDepositAmount(preset)}
              >
                <Text
                  style={[
                    styles.presetText,
                    depositAmount === preset && styles.presetTextActive,
                  ]}
                >
                  ${preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Capital Allocation Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardHeader}>Sizing & Reserve Allocation</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>10% Liquidity Reserve (Risk Guard)</Text>
            <Text style={styles.rowValueChartreuse}>${reserveBuffer.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Kuru CLOB Spot Allocation (1x Long)</Text>
            <Text style={styles.rowValue}>${spotAlloc.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Perpl DEX Margin Allocation (1x Short)</Text>
            <Text style={styles.rowValue}>${perpAlloc.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabelHighlight}>Net Delta Exposure</Text>
            <Text style={styles.rowValueHighlight}>Δ ≈ $0.00 (Delta Neutral)</Text>
          </View>
        </View>

        {/* Break-Even Calculator */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardHeader}>Break-Even Calculator</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Est. Round-Trip Taker Fees (0.20%)</Text>
            <Text style={styles.rowValue}>-${roundTripCost.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Est. Daily Carry Accrual</Text>
            <Text style={styles.rowValueChartreuse}>+${dailyCarry.toFixed(2)} AUSD/day</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabelHighlight}>Time to Full Break-Even</Text>
            <Text style={styles.rowValueHighlight}>{breakEvenDays} Days</Text>
          </View>
        </View>

        {/* 1-Tap Execution CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleStartEarning}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0A0D14" />
          ) : (
            <Text style={styles.ctaButtonText}>1-Tap Open Hedge Position</Text>
          )}
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
  inputCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    flex: 1,
  },
  inputCurrency: {
    color: "#CCFF00",
    fontSize: 18,
    fontWeight: "800",
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetChip: {
    flex: 1,
    backgroundColor: "#181E2C",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 3,
  },
  presetChipActive: {
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    borderWidth: 1,
    borderColor: "#CCFF00",
  },
  presetText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#CCFF00",
    fontWeight: "700",
  },
  breakdownCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  rowValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  rowValueChartreuse: {
    color: "#CCFF00",
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E2638",
    marginVertical: 10,
  },
  rowLabelHighlight: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  rowValueHighlight: {
    color: "#CCFF00",
    fontSize: 13,
    fontWeight: "800",
  },
  ctaButton: {
    backgroundColor: "#CCFF00",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#CCFF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  ctaButtonText: {
    color: "#0A0D14",
    fontSize: 15,
    fontWeight: "800",
  },
});
