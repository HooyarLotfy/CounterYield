import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useAppStore } from "../state/store";
import { usePosition } from "../state/hooks/usePosition";

export const UnwindModal: React.FC = () => {
  const { isUnwindModalOpen, openUnwindModal } = useAppStore();
  const { executeUnwind } = usePosition();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            <Text style={styles.alertIcon}>🔒</Text>
          </View>

          <Text style={styles.modalTitle}>Confirm 1-Tap Unwind</Text>
          <Text style={styles.modalSubtitle}>
            This action instantly liquidates your spot leg on Kuru CLOB and closes your
            short leg on Perpl DEX with a reduce-only market order.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Capital to Return</Text>
              <Text style={styles.summaryValuePositive}>$1,034.20 AUSD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Realized Carry Profit</Text>
              <Text style={styles.summaryValuePositive}>+$34.20 AUSD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Residual Risk</Text>
              <Text style={styles.summaryValue}>0.00% (100% Cash Settlement)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            disabled={isSubmitting}
            onPress={handleConfirmUnwind}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: "rgba(10, 13, 20, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#121620",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  alertIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 24,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#181E2C",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValuePositive: {
    color: "#CCFF00",
    fontSize: 12,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 14,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  cancelButton: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
});
