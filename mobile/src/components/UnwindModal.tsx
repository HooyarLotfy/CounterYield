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
import { XOctagon } from "lucide-react-native";

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
            <XOctagon size={26} color={colors.crimson} strokeWidth={2.2} />
          </View>

          <Text style={styles.modalTitle}>Confirm 1-Tap Unwind</Text>
          <Text style={styles.modalSubtitle}>
            Closes Kuru spot and Perpl short legs simultaneously. All capital converts to unencumbered AUSD.
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
              <Text style={styles.summaryLabel}>Settlement Type</Text>
              <Text style={styles.summaryValue}>Instant Cash Settlement</Text>
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
            <Text style={styles.cancelButtonText}>Cancel & Keep Position</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: space.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  alertIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: "rgba(255, 95, 82, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: space.lg,
  },
  summaryCard: {
    backgroundColor: colors.surfaceCardElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: space.md,
    width: "100%",
    marginBottom: space.lg,
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
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValuePositive: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: colors.crimson,
    borderRadius: radius.pill,
    height: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  confirmButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: space.sm,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
});
