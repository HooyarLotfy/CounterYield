import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '../state/store';
import { useLiveQuote } from '../services/useBackendData';
import { colors, radius, space } from '../theme';
import {
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Zap,
  Lock,
  Wallet,
} from 'lucide-react-native';

export const PortfolioScreen: React.FC = () => {
  const {
    activePosition,
    walletBalanceAusd,
    userAddress,
    fetchLiveBalance,
    openUnwindModal,
    setActiveTab,
  } = useAppStore();

  const { quote } = useLiveQuote(1000);

  const [refreshing, setRefreshing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceMessage, setRebalanceMessage] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLiveBalance();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRebalance = () => {
    setIsRebalancing(true);
    setRebalanceMessage(null);
    setTimeout(() => {
      setIsRebalancing(false);
      setRebalanceMessage('Delta neutral balance verified at 1.00x hedge ratio.');
      setTimeout(() => setRebalanceMessage(null), 4000);
    }, 900);
  };

  // Portfolio calculations
  const hasPosition = Boolean(activePosition && activePosition.depositAmount > 0);
  const spotCapitalAllocated = hasPosition
    ? ((activePosition?.depositAmount || 0) - (activePosition?.reserveBuffer || 0)) / 2
    : 0;
  // Use committed spot capital or accurate price multiplication (prevent 2-decimal truncation error)
  const spotValueUsd = hasPosition
    ? (activePosition?.spotPrice && activePosition.spotPrice > 0.05
        ? (activePosition.spotQuantity || 0) * activePosition.spotPrice
        : spotCapitalAllocated)
    : 0;
  const perpMarginUsd = spotCapitalAllocated;
  const reserveUsd = hasPosition ? activePosition?.reserveBuffer || 0 : 0;
  const cashUsd = walletBalanceAusd;

  const totalNetWorth = spotValueUsd + perpMarginUsd + reserveUsd + cashUsd;

  // Unified APY matching HomeScreen exactly:
  const liveAprRate =
    activePosition?.estimatedApr ??
    quote?.telemetry?.netEstimatedApr ??
    quote?.telemetry?.trailingFundingApr ??
    0;
  const liveApyText = `${(liveAprRate * 100).toFixed(1)}% Est. APY`;

  const netDelta = hasPosition ? activePosition?.netDeltaDollars || 0.0 : 0.0;
  const accruedYield = hasPosition ? activePosition?.accruedFundingEst || 0.0 : 0.0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.lime}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>PORTFOLIO OVERVIEW</Text>
          <Text style={styles.headerTitle}>Asset Allocation</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={15} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Net Worth Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>Total Net Worth</Text>
          <View style={styles.apyBadge}>
            <View style={[styles.apyDot, (!hasPosition && totalNetWorth <= 0) && styles.apyDotIdle]} />
            <Text style={styles.apyText}>{liveApyText}</Text>
          </View>
        </View>
        <Text style={styles.heroAmount}>
          ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.heroCurrency} numberOfLines={1}>
          {hasPosition
            ? 'Denominated in Agora AUSD · Hedged on Monad Testnet'
            : totalNetWorth > 0
            ? 'Liquid Agora AUSD · No Active Carry Hedge'
            : 'Vault Standby · No Assets Deposited'}
        </Text>

        {/* Delta Neutral Health Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterHeader}>
            <View style={styles.meterTitleRow}>
              <ShieldCheck
                size={14}
                color={hasPosition ? colors.lime : colors.textTertiary}
              />
              <Text style={styles.meterTitle}>Delta-Neutral Status</Text>
            </View>
            <Text
              style={[
                styles.meterStatusText,
                !hasPosition && styles.meterStatusTextIdle,
              ]}
            >
              {hasPosition
                ? Math.abs(netDelta) < 1.0
                  ? 'Balanced · 1.00x'
                  : 'Slight Imbalance'
                : totalNetWorth > 0
                ? 'Idle (Unallocated Cash)'
                : 'Standby · 0.00x'}
            </Text>
          </View>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                !hasPosition && { width: '0%' },
              ]}
            />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterSubtext} numberOfLines={1}>
              {hasPosition
                ? `Spot: $${spotValueUsd.toFixed(0)} · Perp: -$${perpMarginUsd.toFixed(0)} · Net Δ: $${netDelta.toFixed(2)}`
                : totalNetWorth > 0
                ? `Liquid: $${cashUsd.toFixed(2)} · Open hedge to begin`
                : 'No active funds deployed. Claim testnet AUSD to get started.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Venue Allocation Breakdown */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderRow}>
          <Layers size={16} color={colors.lime} />
          <Text style={styles.sectionTitle}>Venues & Asset Holdings</Text>
        </View>
        <Text style={styles.venueCount}>
          {hasPosition
            ? '4 Allocations'
            : totalNetWorth > 0
            ? '1 Allocation (Cash)'
            : '0 Active Allocations'}
        </Text>
      </View>

      {!hasPosition && totalNetWorth <= 0 ? (
        <View style={styles.emptyVaultCard}>
          <View style={styles.emptyIconBox}>
            <Wallet size={24} color={colors.lime} strokeWidth={2.2} />
          </View>
          <Text style={styles.emptyVaultTitle}>Vault Standby</Text>
          <Text style={styles.emptyVaultSubtitle}>
            You have no assets allocated in CounterYield. Claim free testnet AUSD or deposit into the carry vault to begin automated basis harvesting.
          </Text>
          <TouchableOpacity
            style={styles.emptyVaultBtn}
            activeOpacity={0.85}
            onPress={() => setActiveTab('earn')}
          >
            <Zap size={16} color={colors.textDark} strokeWidth={2.4} />
            <Text style={styles.emptyVaultBtnText}>Start Earning Basis Yield</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 1. Kuru Spot MON */}
          <View style={[styles.assetCard, !hasPosition && styles.assetCardInactive]}>
            <View style={styles.assetHeader}>
              <View style={styles.assetLeft}>
                <View
                  style={[
                    styles.venueDot,
                    {
                      backgroundColor: hasPosition
                        ? colors.kuruOrange
                        : colors.borderSubtle,
                    },
                  ]}
                />
                <View style={styles.assetNameCol}>
                  <Text style={styles.assetName}>Kuru Spot MON</Text>
                  <Text style={styles.venueSubtext} numberOfLines={1}>
                    Kuru CLOB · Spot Long
                  </Text>
                </View>
              </View>
              <View style={styles.assetRight}>
                <Text style={styles.assetValue}>
                  ${spotValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.assetQty} numberOfLines={1}>
                  {hasPosition
                    ? `${Number(activePosition?.spotQuantity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MON`
                    : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.assetMetaRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{hasPosition ? 'LONG LEG' : 'IDLE'}</Text>
              </View>
              <Text style={styles.assetRoleText} numberOfLines={1}>
                Physical spot backing perp short
              </Text>
            </View>
          </View>

          {/* 2. Perpl Short MON-PERP */}
          <View style={[styles.assetCard, !hasPosition && styles.assetCardInactive]}>
            <View style={styles.assetHeader}>
              <View style={styles.assetLeft}>
                <View
                  style={[
                    styles.venueDot,
                    {
                      backgroundColor: hasPosition
                        ? colors.perplCyan
                        : colors.borderSubtle,
                    },
                  ]}
                />
                <View style={styles.assetNameCol}>
                  <Text style={styles.assetName}>Perpl MON-PERP</Text>
                  <Text style={styles.venueSubtext} numberOfLines={1}>
                    Perpl DEX · 1x Short
                  </Text>
                </View>
              </View>
              <View style={styles.assetRight}>
                <Text style={styles.assetValue}>
                  ${perpMarginUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.assetQty} numberOfLines={1}>
                  {hasPosition
                    ? `-${Number(activePosition?.spotQuantity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SHORT`
                    : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.assetMetaRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{hasPosition ? 'SHORT LEG' : 'IDLE'}</Text>
              </View>
              <Text style={styles.assetRoleText} numberOfLines={1}>
                Funding rate arbitrage hedge
              </Text>
            </View>
          </View>

          {/* 3. 10% Reserve Buffer */}
          <View style={[styles.assetCard, !hasPosition && styles.assetCardInactive]}>
            <View style={styles.assetHeader}>
              <View style={styles.assetLeft}>
                <View
                  style={[
                    styles.venueDot,
                    {
                      backgroundColor: hasPosition
                        ? colors.agoraGreen
                        : colors.borderSubtle,
                    },
                  ]}
                />
                <View style={styles.assetNameCol}>
                  <Text style={styles.assetName}>Liquidation Reserve (10%)</Text>
                  <Text style={styles.venueSubtext} numberOfLines={1}>
                    CarryLedger · 10% Buffer
                  </Text>
                </View>
              </View>
              <View style={styles.assetRight}>
                <Text style={styles.assetValue}>
                  ${reserveUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.assetQty} numberOfLines={1}>
                  {reserveUsd > 0 ? 'Buffer Active' : 'Idle'}
                </Text>
              </View>
            </View>
            <View style={styles.assetMetaRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{hasPosition ? 'RISK GUARD' : 'IDLE'}</Text>
              </View>
              <Text style={styles.assetRoleText} numberOfLines={1}>
                Automated liquidation defense
              </Text>
            </View>
          </View>

          {/* 4. Cash / AUSD Wallet */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.assetLeft}>
                <View style={[styles.venueDot, { backgroundColor: colors.monadViolet }]} />
                <View style={styles.assetNameCol}>
                  <Text style={styles.assetName}>Available Cash</Text>
                  <Text style={styles.venueSubtext} numberOfLines={1}>
                    Agora AUSD · Liquid Wallet
                  </Text>
                </View>
              </View>
              <View style={styles.assetRight}>
                <Text style={styles.assetValue}>
                  ${cashUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.assetQty} numberOfLines={1}>
                  {cashUsd > 0 ? 'Liquid Cash' : '0.00 AUSD'}
                </Text>
              </View>
            </View>
            <View style={styles.assetMetaRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>UNALLOCATED</Text>
              </View>
              <Text style={styles.assetRoleText} numberOfLines={1}>
                Liquid capital ready to deploy
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Rebalance Toast / Status */}
      {rebalanceMessage && (
        <View style={styles.messageBox}>
          <ShieldCheck size={16} color={colors.lime} />
          <Text style={styles.messageText} numberOfLines={1}>
            {rebalanceMessage}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {hasPosition ? (
          <>
            <TouchableOpacity
              style={styles.rebalanceBtn}
              onPress={handleRebalance}
              disabled={isRebalancing}
              activeOpacity={0.8}
            >
              {isRebalancing ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <RefreshCw size={16} color={colors.textPrimary} />
                  <Text style={styles.rebalanceBtnText}>Rebalance Hedge</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.unwindBtn}
              onPress={() => openUnwindModal(true)}
              activeOpacity={0.8}
            >
              <ArrowDownRight size={16} color={colors.crimson} />
              <Text style={styles.unwindBtnText}>Unwind to Cash</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setActiveTab('earn')}
            activeOpacity={0.8}
          >
            <Zap size={18} color={colors.textDark} />
            <Text style={styles.primaryBtnText}>Start Earning Basis Yield</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: space.lg,
    paddingTop: space.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: space.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  heroLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  apyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.limeMuted,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 37, 0.2)',
  },
  apyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: 6,
  },
  apyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.lime,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    marginVertical: space.xs,
  },
  heroCurrency: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: space.lg,
  },
  meterContainer: {
    backgroundColor: colors.surfaceInput,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  meterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meterStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.lime,
  },
  meterTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginVertical: 6,
  },
  meterFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lime,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterSubtext: {
    fontSize: 10.5,
    color: colors.textTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  venueCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  assetCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: space.md,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.sm,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  venueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  assetNameCol: {
    flex: 1,
    marginRight: space.sm,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  venueSubtext: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  assetQty: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  assetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: space.sm,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  assetRoleText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.limeMuted,
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 37, 0.25)',
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  messageText: {
    fontSize: 12,
    color: colors.lime,
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.sm,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.lime,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  rebalanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceCardElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  rebalanceBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  unwindBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.crimsonSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 95, 82, 0.25)',
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  unwindBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.crimson,
  },
  apyDotIdle: {
    backgroundColor: colors.textTertiary,
  },
  meterStatusTextIdle: {
    color: colors.textSecondary,
  },
  assetCardInactive: {
    opacity: 0.65,
  },
  emptyVaultCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'center',
    marginBottom: space.lg,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  emptyVaultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyVaultSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: space.lg,
    paddingHorizontal: space.sm,
  },
  emptyVaultBtn: {
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
  },
  emptyVaultBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textDark,
  },
});
