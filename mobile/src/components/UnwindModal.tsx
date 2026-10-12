import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAppStore } from "../state/store";
import { usePosition } from "../state/hooks/usePosition";
import { colors, radius, space } from "../theme";
import { XOctagon, AlertTriangle, ShieldCheck } from "lucide-react-native";

export const UnwindModal: React.FC = () => {
  const { isUnwindModalOpen, openUnwindModal, activePosition } = useAppStore();
  const { executeUnwind } = usePosition();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const deposit = activePosition?.depositAmount ?? 1000.0;
  const accrued = activePosition?.accruedFundingEst ?? 0.0;
  const totalReturn = deposit + accrued;

  const handleConfirmUnwind = async () => {
    setIsSubmitting(true);
    try {
      await executeUnwind("MANUAL_1_TAP_UNWIND");
    } finally {
      setIsSubmitting(false);
      openUnwindModal(false);
    }
  };

  return (
    <Modal
      visible={isUnwindModalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => openUnwindModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.alertIconBadge}>
            <XOctagon size={28} color={colors.crimson} strokeWidth={2.2} />
          </View>

          <Text style={styles.modalTitle}>Confirm 1-Tap Unwind</Text>
          <Text style={styles.modalSubtitle}>
            Instantly market-sells your spot MON on Kuru CLOB and closes your short leg on Perpl DEX.
            All capital reverts immediately to 100% unencumbered AUSD.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Capital to Return</Text>
              <Text style={styles.summaryValuePositive}>
                ${totalReturn.toFixed(2)} AUSD
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Accrued Carry Profit</Text>
              <Text style={styles.summaryValuePositive}>
                +${accrued.toFixed(2)} AUSD
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Residual Market Risk</Text>
              <Text style={styles.summaryValue}>0.00% (Cash Settlement)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            disabled={isSubmitting}
            onPress={handleConfirmUnwind}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.confirmButtonText}>Execute Immediate Unwind</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => openUnwindModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel & Keep Earning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(8, 11, 17, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  alertIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  summaryValuePositive: {
    color: colors.lime,
    fontSize: 12.5,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: colors.crimson,
    borderRadius: radius.lg,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
