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
import { useLiveQuote, useStrategyExecution } from "../services/useBackendData";
import { colors, radius, space } from "../theme";
import { KuruLogo, PerplLogo, AusdLogo } from "../components/Logos";
import {
  Zap,
  Shield,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react-native";

export const StartEarningScreen: React.FC = () => {
  const { userAddress, setActiveTab, walletBalanceAusd } = useAppStore();
  const [depositAmount, setDepositAmount] = useState<string>("1000");

  const numericDeposit = parseFloat(depositAmount) || 0;
  const { quote, isLoading: isQuoteLoading } = useLiveQuote(numericDeposit);
  const { enterStrategy, isSubmitting, executionError } = useStrategyExecution();

  const reserveBuffer = numericDeposit * 0.1;
  const activeCapital = numericDeposit - reserveBuffer;
  const spotAlloc = activeCapital / 2;
  const perpAlloc = activeCapital / 2;

  const apr = quote?.telemetry?.netEstimatedApr ?? (quote ? 0 : 0);

  const handleStartEarning = async () => {
    if (numericDeposit <= 0 || !userAddress) return;

    const res = await enterStrategy({
      ownerAddress: userAddress,
      depositAmount: numericDeposit,
      leverage: 1,
      maxSlippageBps: 20,
    });

    if (res?.success) {
      setActiveTab("portfolio");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
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
            <Text style={styles.headerTagText}>10143 · Carry Vault</Text>
          </View>
        </View>

        {/* Clean Page Title */}
        <Text style={styles.screenTitle}>Start Earning</Text>
        <Text style={styles.screenSubtitle}>
          Deposit AUSD to lock funding arbitrage with zero directional risk.
        </Text>

        {/* Deposit Input Card (Uniswap Inset Pattern) */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.inputLabel}>Deposit Amount</Text>
            <Text style={styles.inputBalance}>
              Avail: ${walletBalanceAusd.toFixed(2)} AUSD
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.currencyBadge}>
              <Text style={styles.inputCurrency}>AUSD</Text>
            </View>
          </View>

          {/* Quick Preset Chips */}
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
          <Text style={styles.cardHeader}>Automated Allocation</Text>

          {/* 10% Reserve */}
          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={{ marginRight: 10 }}>
                <AusdLogo size={24} />
              </View>
              <View>
                <Text style={styles.allocTitle}>10% Reserve Buffer</Text>
                <Text style={styles.allocDesc}>Liquidation & margin buffer</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${reserveBuffer.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.divider} />

          {/* Kuru Spot */}
          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={{ marginRight: 10 }}>
                <KuruLogo size={24} />
              </View>
              <View>
                <Text style={styles.allocTitle}>Kuru Spot MON (Long)</Text>
                <Text style={styles.allocDesc}>Spot asset allocation (45%)</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${spotAlloc.toFixed(2)} AUSD</Text>
          </View>

          <View style={styles.divider} />

          {/* Perpl Short */}
          <View style={styles.allocRow}>
            <View style={styles.allocLeft}>
              <View style={{ marginRight: 10 }}>
                <PerplLogo size={24} />
              </View>
              <View>
                <Text style={styles.allocTitle}>Perpl 1x Short (Market 64)</Text>
                <Text style={styles.allocDesc}>Delta-neutral hedge (45%)</Text>
              </View>
            </View>
            <Text style={styles.allocAmount}>${perpAlloc.toFixed(2)} AUSD</Text>
          </View>
        </View>


        {/* Execution Error Alert */}
        {executionError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} numberOfLines={2}>
              {executionError}
            </Text>
          </View>
        )}

        {/* 1-Tap Execution CTA */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          disabled={isSubmitting || numericDeposit <= 0 || !userAddress}
          onPress={handleStartEarning}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <>
              <Zap size={18} color={colors.textDark} strokeWidth={2.4} />
              <Text style={styles.submitBtnText}>
                {!userAddress ? "Unlock Vault First" : "1-Tap Open Hedge Position"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bottom Spacer */}
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.md,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  headerTagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: space.lg,
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.lg,
    marginBottom: space.md,
  },
  inputCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.xs,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  inputBalance: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: space.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    padding: 0,
  },
  currencyBadge: {
    backgroundColor: colors.surfaceCardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  inputCurrency: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  presetRow: {
    flexDirection: "row",
    gap: space.xs,
    marginTop: space.sm,
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.surfaceCardElevated,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipActive: {
    backgroundColor: colors.limeSoft,
    borderWidth: 1,
    borderColor: colors.lime,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  presetTextActive: {
    color: colors.lime,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.lg,
    marginBottom: space.md,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: space.md,
  },
  allocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allocLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  allocDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  allocTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  allocDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  allocAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: space.md,
  },
  estimatorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space.lg,
    marginBottom: space.lg,
  },
  estimatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: space.sm,
  },
  estimatorTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  estimatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  estimatorLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  estimatorValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.lime,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  submitBtnText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 95, 82, 0.3)',
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: "600",
  },
});
