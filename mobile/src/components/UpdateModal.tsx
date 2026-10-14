import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { colors, radius, space } from '../theme';
import { MonadLogo } from './Logos';
import { ArrowDownCircle, Sparkles, X, ShieldCheck } from 'lucide-react-native';
import type { AppVersionInfo } from '../services/useAppUpdater';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: AppVersionInfo | null;
  currentVersion: { versionCode: number; versionName: string };
  onInstall: () => void;
  onDismiss: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  currentVersion,
  onInstall,
  onDismiss,
}) => {
  if (!visible || !updateInfo) return null;

  const isMandatory =
    (updateInfo.minSupportedVersionCode || 1) > currentVersion.versionCode;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Sparkles size={20} color={colors.lime} />
              </View>
              <View>
                <Text style={styles.title}>Update Available</Text>
                <Text style={styles.versionBadge}>
                  v{currentVersion.versionName} → v{updateInfo.versionName}
                </Text>
              </View>
            </View>
            {!isMandatory && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Release Notes */}
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>WHAT'S NEW</Text>
            <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
          </View>

          {/* Security Guarantee */}
          <View style={styles.guaranteeRow}>
            <ShieldCheck size={14} color={colors.lime} />
            <Text style={styles.guaranteeText}>
              In-place package update. Your biometric passkeys, positions, and wallet credentials will be preserved.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.installBtn}
              activeOpacity={0.85}
              onPress={onInstall}
            >
              <ArrowDownCircle size={18} color="#0D0E11" strokeWidth={2.4} />
              <Text style={styles.installBtnText}>Download & Install Update</Text>
            </TouchableOpacity>

            {!isMandatory && (
              <TouchableOpacity
                style={styles.laterBtn}
                activeOpacity={0.7}
                onPress={onDismiss}
              >
                <Text style={styles.laterBtnText}>Remind Me Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 37, 0.25)',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(159, 232, 37, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 37, 0.25)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.lime,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  notesBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: space.md,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  notesText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: space.xl,
    paddingHorizontal: 2,
  },
  guaranteeText: {
    flex: 1,
    color: colors.textTertiary,
    fontSize: 11,
    lineHeight: 15,
  },
  actions: {
    gap: 10,
  },
  installBtn: {
    backgroundColor: colors.lime,
    height: 50,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  installBtnText: {
    color: '#0D0E11',
    fontSize: 15,
    fontWeight: '800',
  },
  laterBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  laterBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
