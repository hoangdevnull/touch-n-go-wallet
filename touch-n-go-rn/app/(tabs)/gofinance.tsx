import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Field, PrimaryButton, SectionTitle } from "../../components/ui";
import { colors, radius } from "../../constants/theme";
import { money } from "../../src/domain/format";
import { tokenizedAssets, type TokenizedAsset } from "../../src/domain/investments";
import { useInvestments } from "../../src/state/InvestmentProvider";
import { useWallet } from "../../src/state/WalletProvider";

type TradeAction = "buy" | "sell";

export default function GoFinanceScreen() {
  const { state, store } = useInvestments();
  const { state: walletState, store: walletStore } = useWallet();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [units, setUnits] = useState("1");

  const selectedAsset = tokenizedAssets.find((asset) => asset.id === selectedAssetId) ?? null;

  const portfolioValue = useMemo(
    () =>
      state.holdings.reduce((total, holding) => {
        const asset = tokenizedAssets.find((item) => item.id === holding.assetId);
        return total + holding.units * (asset?.unitPrice ?? holding.averagePrice);
      }, 0),
    [state.holdings],
  );

  const parseUnits = () => Number.parseInt(units, 10) || 0;

  if (selectedAsset) {
    const holding = state.holdings.find((item) => item.assetId === selectedAsset.id);
    return (
      <AssetDetailScreen
        asset={selectedAsset}
        heldUnits={holding?.units ?? 0}
        lastReferenceId={holding?.lastReferenceId}
        units={units}
        walletBalance={walletState.wallet.balance}
        onUnitsChange={setUnits}
        onBack={() => setSelectedAssetId(null)}
        onBuy={async () => {
          const unitsToTrade = parseUnits();
          const payment = walletStore.buyTokenizedAsset(
            selectedAsset.name,
            selectedAsset.symbol,
            unitsToTrade * selectedAsset.unitPrice,
          );
          if (!payment.ok) return payment;
          return store.buy(selectedAsset.id, unitsToTrade);
        }}
        onSell={async () => {
          const unitsToTrade = parseUnits();
          const result = await store.sell(selectedAsset.id, unitsToTrade);
          if (result.ok) {
            walletStore.sellTokenizedAsset(
              selectedAsset.name,
              selectedAsset.symbol,
              unitsToTrade * selectedAsset.unitPrice,
            );
          }
          return result;
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name="cash-outline" size={24} color={colors.surface} />
          </View>
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>BPMB demo</Text>
          </View>
        </View>
        <Text style={styles.heroEyebrow}>BPMB x Touch n Go</Text>
        <Text style={styles.heroTitle}>GOFinance</Text>
        <Text style={styles.heroSub}>Browse tokenized Malaysian assets, open the detail page, then buy or sell in two taps.</Text>
      </View>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Portfolio value</Text>
          <Text style={styles.summaryValue}>{money(portfolioValue)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Demo mode</Text>
          <Text style={styles.summaryAccount}>Local orders</Text>
        </Card>
      </View>

      <SectionTitle title="Available assets" action={`${tokenizedAssets.length} live`} />
      <View style={styles.assetList}>
        {tokenizedAssets.map((asset) => {
          const holding = state.holdings.find((item) => item.assetId === asset.id);
          return (
            <AssetListItem
              key={asset.id}
              asset={asset}
              heldUnits={holding?.units ?? 0}
              onPress={() => {
                setUnits("1");
                setSelectedAssetId(asset.id);
              }}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

function AssetListItem({
  asset,
  heldUnits,
  onPress,
}: {
  asset: TokenizedAsset;
  heldUnits: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.assetListItem} onPress={onPress}>
      <View style={styles.assetMark}>
        <Ionicons name={asset.risk === "Low" ? "leaf" : "business-outline"} size={22} color={colors.blue} />
      </View>
      <View style={styles.assetListCopy}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetMeta}>
          {asset.symbol} • {asset.issuer} • {asset.projectedYield}
        </Text>
      </View>
      <View style={styles.assetListRight}>
        <Text style={styles.assetPrice}>{money(asset.unitPrice)}</Text>
        <Text style={styles.assetHeld}>{heldUnits} units</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function AssetDetailScreen({
  asset,
  heldUnits,
  lastReferenceId,
  units,
  walletBalance,
  onUnitsChange,
  onBack,
  onBuy,
  onSell,
}: {
  asset: TokenizedAsset;
  heldUnits: number;
  lastReferenceId?: string;
  units: string;
  walletBalance: number;
  onUnitsChange: (value: string) => void;
  onBack: () => void;
  onBuy: () => Promise<unknown>;
  onSell: () => Promise<unknown>;
}) {
  const numericUnits = Number.parseInt(units, 10) || 0;
  const estimatedValue = numericUnits * asset.unitPrice;
  const [pendingAction, setPendingAction] = useState<TradeAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const normalizedUnits = units.trim();
  const hasWholeUnits = /^\d+$/.test(normalizedUnits);
  const unitError = !normalizedUnits
    ? "Enter the number of units."
    : !hasWholeUnits || numericUnits <= 0
      ? "Enter a valid whole number of units."
      : null;
  const buyError = unitError
    ? unitError
    : estimatedValue > walletBalance
      ? `Your wallet balance is ${money(walletBalance)}.`
      : null;
  const sellError = unitError
    ? unitError
    : heldUnits <= 0
      ? "You do not hold any units to sell."
      : numericUnits > heldUnits
        ? `You only hold ${heldUnits} ${asset.symbol} units.`
        : null;
  const canBuy = !buyError;
  const canSell = !sellError;
  const visibleError = unitError ?? buyError ?? (numericUnits > heldUnits ? sellError : null);

  const closeConfirm = () => {
    if (!isProcessing) setPendingAction(null);
  };

  const openTradeConfirm = (action: TradeAction) => {
    if (action === "buy" && canBuy) setPendingAction("buy");
    if (action === "sell" && canSell) setPendingAction("sell");
  };

  const confirmTrade = async () => {
    if (!pendingAction || isProcessing) return;
    if (pendingAction === "buy" && !canBuy) return;
    if (pendingAction === "sell" && !canSell) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await (pendingAction === "buy" ? onBuy() : onSell());
      setPendingAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.blue} />
        <Text style={styles.backText}>Assets</Text>
      </Pressable>

      <View style={styles.detailHero}>
        <View style={styles.detailHeader}>
          <View style={styles.detailMark}>
            <Ionicons name={asset.risk === "Low" ? "leaf" : "business-outline"} size={28} color={colors.surface} />
          </View>
          <View style={styles.yieldPill}>
            <Text style={styles.yieldText}>{asset.projectedYield}</Text>
          </View>
        </View>
        <Text style={styles.detailSymbol}>{asset.symbol}</Text>
        <Text style={styles.detailTitle}>{asset.name}</Text>
        <Text style={styles.detailSub}>{asset.issuer} tokenized asset</Text>
      </View>

      <View style={styles.detailStats}>
        <Stat label="Unit price" value={money(asset.unitPrice)} />
        <Stat label="Held units" value={String(heldUnits)} />
        <Stat label="Wallet" value={money(walletBalance)} />
      </View>

      <Card style={styles.tradeCard}>
        <SectionTitle title="Trade asset" action="2-click" />
        <Field label="Units" value={units} onChangeText={onUnitsChange} keyboardType="number-pad" />
        {visibleError ? <Text style={styles.validationText}>{visibleError}</Text> : null}
        <View style={styles.estimateRow}>
          <Text style={styles.estimateLabel}>Estimated value</Text>
          <Text style={styles.estimateValue}>{money(estimatedValue)}</Text>
        </View>
        <View style={styles.tradeButtons}>
          <View style={styles.tradeButtonSlot}>
            <PrimaryButton
              label="Buy now"
              icon="add-circle"
              disabled={!canBuy}
              onPress={() => openTradeConfirm("buy")}
            />
          </View>
          <Pressable
            disabled={!canSell}
            style={[styles.sellButton, !canSell && styles.disabledAction]}
            onPress={() => openTradeConfirm("sell")}
          >
            <Ionicons name="remove-circle" size={18} color={canSell ? colors.blue : colors.textMuted} />
            <Text style={[styles.sellText, !canSell && styles.disabledSellText]}>Sell</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.contractCard}>
        <SectionTitle title="Investment details" />
        <DetailRow label="Reference" value={asset.referenceId} />
        <DetailRow label="Asset type" value={asset.assetType} />
        <DetailRow label="Jurisdiction" value={asset.jurisdiction} />
        <DetailRow label="Minimum" value={money(asset.minimumInvestment)} />
        <DetailRow label="Last order" value={lastReferenceId ?? "No order yet"} />
      </Card>

      <TradeConfirmModal
        action={pendingAction}
        asset={asset}
        estimatedValue={estimatedValue}
        isProcessing={isProcessing}
        units={numericUnits}
        onCancel={closeConfirm}
        onConfirm={confirmTrade}
      />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

function TradeConfirmModal({
  action,
  asset,
  estimatedValue,
  isProcessing,
  units,
  onCancel,
  onConfirm,
}: {
  action: TradeAction | null;
  asset: TokenizedAsset;
  estimatedValue: number;
  isProcessing: boolean;
  units: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isBuy = action === "buy";

  return (
    <Modal animationType="fade" transparent visible={action !== null} onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.confirmSheet}>
          <View style={styles.confirmIcon}>
            {isProcessing ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Ionicons name={isBuy ? "add-circle" : "remove-circle"} size={26} color={colors.surface} />
            )}
          </View>
          <Text style={styles.confirmEyebrow}>{isProcessing ? "Processing secure order" : "Confirm order"}</Text>
          <Text style={styles.confirmTitle}>
            {isBuy ? "Buy" : "Sell"} {units || 0} {asset.symbol} units
          </Text>
          <Text style={styles.confirmSub}>
            {isProcessing
              ? "Checking eligibility, reserving units, and generating a demo order reference."
              : "Review this order before we submit it to the BPMB tokenized asset demo flow."}
          </Text>

          <View style={styles.confirmSummary}>
            <DetailRow label="Asset" value={asset.name} />
            <DetailRow label="Estimated value" value={money(estimatedValue)} />
            <DetailRow label="Reference" value={asset.referenceId} />
          </View>

          <View style={styles.confirmButtons}>
            <Pressable
              disabled={isProcessing}
              style={[styles.cancelButton, isProcessing && styles.disabledAction]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isProcessing}
              style={[styles.confirmButton, isProcessing && styles.disabledAction]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{isProcessing ? "Submitting" : "Confirm"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.blue,
    borderRadius: radius.xl,
    padding: 20,
  },
  heroTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  demoPill: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  demoPillText: { color: colors.surface, fontSize: 11, fontWeight: "900" },
  heroEyebrow: {
    color: "#D9E8FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 14,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  heroSub: {
    color: "#D9E8FF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 8,
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, padding: 14 },
  summaryLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "800" },
  summaryValue: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 5 },
  summaryAccount: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: 7 },
  assetList: { gap: 10 },
  assetListItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  assetMark: {
    alignItems: "center",
    backgroundColor: "#E6F1FA",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  assetListCopy: { flex: 1, minWidth: 0 },
  assetName: { color: colors.text, fontSize: 15, fontWeight: "900" },
  assetMeta: { color: colors.textMuted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  assetListRight: { alignItems: "flex-end" },
  assetPrice: { color: colors.text, fontSize: 13, fontWeight: "900" },
  assetHeld: { color: colors.textMuted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  backButton: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 4 },
  backText: { color: colors.blue, fontSize: 14, fontWeight: "900" },
  detailHero: { backgroundColor: colors.blue, borderRadius: radius.xl, padding: 20 },
  detailHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  detailMark: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  yieldPill: { backgroundColor: "#FFF8E6", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  yieldText: { color: "#9A6B00", fontSize: 12, fontWeight: "900" },
  detailSymbol: { color: "#D9E8FF", fontSize: 13, fontWeight: "900", marginTop: 20 },
  detailTitle: { color: colors.surface, fontSize: 25, fontWeight: "900", lineHeight: 29, marginTop: 4 },
  detailSub: { color: "#D9E8FF", fontSize: 13, fontWeight: "700", marginTop: 8 },
  detailStats: { flexDirection: "row", gap: 8 },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  statValue: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 6 },
  tradeCard: { gap: 13 },
  estimateRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  estimateLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  estimateValue: { color: colors.text, fontSize: 16, fontWeight: "900" },
  validationText: { color: colors.danger, fontSize: 12, fontWeight: "800", lineHeight: 17 },
  tradeButtons: { flexDirection: "row", gap: 8 },
  tradeButtonSlot: { flex: 1 },
  sellButton: {
    alignItems: "center",
    borderColor: colors.blue,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sellText: { color: colors.blue, fontSize: 13, fontWeight: "900" },
  disabledSellText: { color: colors.textMuted },
  contractCard: { gap: 10 },
  detailRow: { borderTopColor: colors.border, borderTopWidth: 1, gap: 4, paddingTop: 10 },
  detailRowLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "800" },
  detailRowValue: { color: colors.text, fontSize: 12, fontWeight: "800" },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(12,19,31,0.46)",
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  confirmSheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    gap: 14,
    padding: 20,
    width: "100%",
  },
  confirmIcon: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  confirmEyebrow: { color: colors.blue, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  confirmTitle: { color: colors.text, fontSize: 22, fontWeight: "900", lineHeight: 27 },
  confirmSub: { color: colors.textMuted, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  confirmSummary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    gap: 10,
    padding: 12,
  },
  confirmButtons: { flexDirection: "row", gap: 10 },
  cancelButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  cancelText: { color: colors.text, fontSize: 13, fontWeight: "900" },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderRadius: radius.md,
    flex: 1,
    paddingVertical: 13,
  },
  confirmButtonText: { color: colors.surface, fontSize: 13, fontWeight: "900" },
  disabledAction: { opacity: 0.55 },
});
