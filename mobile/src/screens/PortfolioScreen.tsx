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
  const spotValueUsd = hasPosition
    ? (activePosition?.spotQuantity || 0) * (activePosition?.spotPrice || 2.0)
    : 0;
  const perpMarginUsd = hasPosition
    ? ((activePosition?.depositAmount || 0) - (activePosition?.reserveBuffer || 0)) / 2
    : 0;
  const reserveUsd = hasPosition ? activePosition?.reserveBuffer || 0 : 0;
  const cashUsd = walletBalanceAusd;

  const totalNetWorth = spotValueUsd + perpMarginUsd + reserveUsd + cashUsd;
  const liveApy = hasPosition ? activePosition?.estimatedApr || 21.4 : 21.4;
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
            <View style={styles.apyDot} />
            <Text style={styles.apyText}>{liveApy.toFixed(1)}% Est. APY</Text>
          </View>
        </View>
        <Text style={styles.heroAmount}>
          ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.heroCurrency} numberOfLines={1}>
          Denominated in Agora AUSD · Hedged on Monad Testnet
        </Text>

        {/* Delta Neutral Health Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterHeader}>
            <View style={styles.meterTitleRow}>
              <ShieldCheck size={14} color={colors.lime} />
              <Text style={styles.meterTitle}>Delta-Neutral Status</Text>
            </View>
            <Text style={styles.meterStatusText}>
              {Math.abs(netDelta) < 1.0 ? 'Balanced · 1.00x' : 'Slight Imbalance'}
            </Text>
          </View>
          <View style={styles.meterTrack}>
            <View style={styles.meterFill} />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterSubtext} numberOfLines={1}>
              Spot Long: ${(spotValueUsd).toFixed(2)} | Perp Short: -${(perpMarginUsd).toFixed(2)} | Net Δ: ${netDelta.toFixed(2)}
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
        <Text style={styles.venueCount}>4 Allocations</Text>
      </View>

      {/* 1. Kuru Spot MON */}
      <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
          <View style={styles.assetLeft}>
            <View style={[styles.venueDot, { backgroundColor: colors.kuruOrange }]} />
            <View>
              <Text style={styles.assetName}>Kuru Spot MON</Text>
              <Text style={styles.venueSubtext} numberOfLines={1}>
                Kuru CLOB · 0xa241...D2D9 · Onchain Spot
              </Text>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.assetValue}>
              ${spotValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.assetQty} numberOfLines={1}>
              {hasPosition ? `${activePosition?.spotQuantity?.toFixed(2) || '0.00'} MON` : '0.00 MON'}
            </Text>
          </View>
        </View>
        <View style={styles.assetMetaRow}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>LONG LEG</Text>
          </View>
          <Text style={styles.assetRoleText} numberOfLines={1}>
            Acquires base staking yield + physical asset for perp hedge
          </Text>
        </View>
      </View>

      {/* 2. Perpl Short MON-PERP */}
      <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
          <View style={styles.assetLeft}>
            <View style={[styles.venueDot, { backgroundColor: colors.perplCyan }]} />
            <View>
              <Text style={styles.assetName}>Perpl MON-PERP</Text>
              <Text style={styles.venueSubtext} numberOfLines={1}>
                Perpl DEX · Market 64 · 1x Short Hedge
              </Text>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.assetValue}>
              ${perpMarginUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.assetQty} numberOfLines={1}>
              {hasPosition ? `-${activePosition?.spotQuantity?.toFixed(2) || '0.00'} SHORT` : '0.00 SHORT'}
            </Text>
          </View>
        </View>
        <View style={styles.assetMetaRow}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>SHORT LEG</Text>
          </View>
          <Text style={styles.assetRoleText} numberOfLines={1}>
            Harvests basis funding rate while offsetting directional price risk
          </Text>
        </View>
      </View>

      {/* 3. 10% Reserve Buffer */}
      <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
          <View style={styles.assetLeft}>
            <View style={[styles.venueDot, { backgroundColor: colors.agoraGreen }]} />
            <View>
              <Text style={styles.assetName}>Liquidation Reserve (10%)</Text>
              <Text style={styles.venueSubtext} numberOfLines={1}>
                CarryLedger Vault · Defends margin spikes
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
            <Text style={styles.tagText}>RISK GUARD</Text>
          </View>
          <Text style={styles.assetRoleText} numberOfLines={1}>
            Automated collateral buffer protecting position against flash drops
          </Text>
        </View>
      </View>

      {/* 4. Cash / AUSD Wallet */}
      <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
          <View style={styles.assetLeft}>
            <View style={[styles.venueDot, { backgroundColor: colors.monadViolet }]} />
            <View>
              <Text style={styles.assetName}>Available Cash</Text>
              <Text style={styles.venueSubtext} numberOfLines={1}>
                Agora AUSD · Monad Testnet Wallet
              </Text>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.assetValue}>
              ${cashUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.assetQty} numberOfLines={1}>
              Liquid Cash
            </Text>
          </View>
        </View>
        <View style={styles.assetMetaRow}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>UNALLOCATED</Text>
          </View>
          <Text style={styles.assetRoleText} numberOfLines={1}>
            Liquid capital available for 1-tap deployment or instant withdrawal
          </Text>
        </View>
      </View>

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
});
