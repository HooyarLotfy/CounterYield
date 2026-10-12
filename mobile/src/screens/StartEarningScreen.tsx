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
import { useAppStore } from "../state/store";
import { backendApi } from "../services/backendApi";
import { colors, radius, space } from "../theme";
import {
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  ChevronLeft,
} from "lucide-react-native";

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
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => setActiveTab("home")}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
            <Text style={styles.backButtonText}>Home</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>1-Tap Basis Sizer</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Start Earning</Text>
        <Text style={styles.screenSubtitle}>
          Enter AUSD deposit amount. The protocol automatically hedges spot & short legs with a 10% reserve.
        </Text>

        {/* Deposit Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Deposit Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.currencyBadge}>
              <Text style={styles.inputCurrency}>AUSD</Text>
            </View>
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
                activeOpacity={0.7}
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

        {/* Dual-Leg Sizing Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardHeader}>Automated Capital Allocation</Text>

          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={[styles.allocDot, { backgroundColor: colors.agoraGreen }]} />
              <View>
                <Text style={styles.allocTitle}>10% Liquidity Reserve</Text>
                <Text style={styles.allocDesc}>Absorbs price wicks & top-ups</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${reserveBuffer.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={[styles.allocDot, { backgroundColor: colors.kuruOrange }]} />
              <View>
                <Text style={styles.allocTitle}>Kuru Spot MON (Long)</Text>
                <Text style={styles.allocDesc}>Spot asset backing (45%)</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${spotAlloc.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={[styles.allocDot, { backgroundColor: colors.monadViolet }]} />
              <View>
                <Text style={styles.allocTitle}>Perpl 1x Short (Market 64)</Text>
                <Text style={styles.allocDesc}>Delta neutralization hedge (45%)</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${perpAlloc.toFixed(2)} AUSD</Text>
          </View>
        </View>

        {/* Break-Even Calculator Card */}
        <View style={styles.estimatorCard}>
          <View style={styles.estimatorHeader}>
            <Clock size={16} color={colors.lime} strokeWidth={2.4} />
            <Text style={styles.estimatorTitle}>Break-Even Estimator</Text>
          </View>

          <View style={styles.estimatorRow}>
            <View>
              <Text style={styles.estimatorLabel}>Est. Round-Trip Fees</Text>
              <Text style={styles.estimatorValue}>-${roundTripCost.toFixed(2)} AUSD</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.estimatorLabel}>Daily Carry Rate</Text>
              <Text style={[styles.estimatorValue, { color: colors.lime }]}>
                +${dailyCarry.toFixed(2)}/day
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.estimatorLabel}>Days to Profit</Text>
              <Text style={[styles.estimatorValue, { color: colors.lime }]}>
                {breakEvenDays} Days
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          disabled={isSubmitting || numericDeposit <= 0}
          onPress={handleStartEarning}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <>
              <Zap size={20} color={colors.textDark} strokeWidth={2.4} />
              <Text style={styles.submitBtnText}>1-Tap Open Hedge Position</Text>
            </>
          )}
        </TouchableOpacity>

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
  headerTag: {
    backgroundColor: colors.limeMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  headerTagText: {
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
  inputCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 20,
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    padding: 0,
  },
  currencyBadge: {
    backgroundColor: colors.glassFillLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  inputCurrency: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: 8,
    marginHorizontal: 3,
  },
  presetChipActive: {
    backgroundColor: colors.limeMuted,
    borderColor: colors.lime,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  presetTextActive: {
    color: colors.lime,
    fontWeight: "700",
  },
  breakdownCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },
  allocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  allocLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  allocDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  allocTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  allocDesc: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  allocAmount: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 10,
  },
  estimatorCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 20,
  },
  estimatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  estimatorTitle: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
    marginLeft: 8,
  },
  estimatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  estimatorLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  estimatorValue: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    borderRadius: radius.lg,
    paddingVertical: 16,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: colors.textDark,
    fontSize: 14.5,
    fontWeight: "800",
    marginLeft: 8,
  },
});
