import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../../constants/theme";
import { tokenAssets } from "../../src/domain/assets";
import { money } from "../../src/domain/format";
import { useGrab } from "../../src/state/GrabProvider";
import type { TokenAsset } from "../../src/domain/types";

type PaymentView = "wallet" | "assets";

export default function PaymentScreen() {
  const { state, store } = useGrab();
  const [view, setView] = useState<PaymentView>("wallet");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<TokenAsset | null>(null);

  if (showScanner) {
    return <ScannerMockup onClose={() => setShowScanner(false)} />;
  }

  if (selectedAsset) {
    return (
      <AssetDetailScreen
        asset={selectedAsset}
        walletBalance={state.balance}
        heldUnits={state.tokenHoldings.find((h) => h.assetId === selectedAsset.id)?.units ?? 0}
        onBack={() => setSelectedAsset(null)}
        onBuy={(units) => store.buyTokenAsset(selectedAsset.id, selectedAsset.unitPrice, units)}
        onSell={(units) => store.sellTokenAsset(selectedAsset.id, selectedAsset.unitPrice, units)}
      />
    );
  }

  const portfolioValue = state.tokenHoldings.reduce((sum, h) => {
    const asset = tokenAssets.find((a) => a.id === h.assetId);
    return sum + h.units * (asset?.unitPrice ?? h.averagePrice);
  }, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GrabPay Wallet</Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabToggle}>
        <Pressable
          style={[styles.tabBtn, view === "wallet" && styles.tabBtnActive]}
          onPress={() => setView("wallet")}
        >
          <Text style={[styles.tabBtnText, view === "wallet" && styles.tabBtnTextActive]}>Wallet</Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, view === "assets" && styles.tabBtnActive]}
          onPress={() => setView("assets")}
        >
          <Text style={[styles.tabBtnText, view === "assets" && styles.tabBtnTextActive]}>
            Token Assets
          </Text>
        </Pressable>
      </View>

      {view === "wallet" ? (
        <>
          {/* Virtual card */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={["#0055F0", "#0037A3", "#00843D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.virtualCard}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardTier}>GRABPAY PREMIUM</Text>
                  <Text style={styles.cardName}>John Doe</Text>
                </View>
                <View style={styles.platinumBadge}>
                  <Text style={styles.platinumText}>PLATINUM</Text>
                </View>
              </View>
              <View>
                <Text style={styles.cardBalLabel}>Available Balance</Text>
                <Text style={styles.cardBalance}>{money(state.balance)}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardNumber}>••••  ••••  ••••  8829</Text>
                <View style={styles.cardPoints}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <Text style={styles.cardPointsText}>{state.rewardsPoints} pts</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Top up panel */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>Quick Top Up</Text>
            <View style={styles.topUpRow}>
              {[10, 25, 50].map((amt) => (
                <Pressable key={amt} style={styles.topUpBtn} onPress={() => store.addBalance(amt)}>
                  <Text style={styles.topUpBtnText}>+${amt}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Rewards tier */}
          <View style={styles.sectionCard}>
            <View style={styles.rewardsTierRow}>
              <View style={styles.rewardsLeft}>
                <View style={styles.rewardsTierIcon}>
                  <Ionicons name="star" size={14} color={colors.textGray} />
                </View>
                <Text style={styles.rewardsTierTitle}>Silver Member Status</Text>
              </View>
              <Text style={styles.rewardsTierTarget}>Gold at 2,000 pts</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((state.rewardsPoints / 2000) * 100, 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.rewardsHint}>
              {Math.max(0, 2000 - state.rewardsPoints)} more points to reach Gold tier.
            </Text>
          </View>

          {/* Invest CTA */}
          <Pressable style={styles.investCta} onPress={() => setView("assets")}>
            <MaterialCommunityIcons name="chart-line" size={22} color={colors.green} />
            <View style={styles.investCtaCopy}>
              <Text style={styles.investCtaTitle}>GrabPay Token Investments</Text>
              <Text style={styles.investCtaSub}>Earn up to 12% p.a. • Portfolio: {money(portfolioValue)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textGray} />
          </Pressable>

          {/* Recent transactions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>Recent Transactions</Text>
            {MOCK_TXS.map((tx, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.txRow}>
                  <View style={styles.txIconBg}>
                    <Ionicons
                      name={tx.isCredit ? "add" : "remove"}
                      size={14}
                      color={colors.textGray}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txSub}>{tx.sub}</Text>
                  </View>
                  <Text style={[styles.txAmount, tx.isCredit && styles.txAmountCredit]}>
                    {tx.isCredit ? "+" : "-"}{tx.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* QR Scanner button */}
          <Pressable style={styles.scanBtn} onPress={() => setShowScanner(true)}>
            <Ionicons name="qr-code-outline" size={18} color="#fff" />
            <Text style={styles.scanBtnText}>Scan QR to Pay</Text>
          </Pressable>
        </>
      ) : (
        <TokenAssetsView
          walletBalance={state.balance}
          holdings={state.tokenHoldings}
          portfolioValue={portfolioValue}
          onSelectAsset={setSelectedAsset}
        />
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Token Assets List View ───────────────────────────────────────────────────
function TokenAssetsView({
  walletBalance,
  holdings,
  portfolioValue,
  onSelectAsset,
}: {
  walletBalance: number;
  holdings: { assetId: string; units: number; averagePrice: number }[];
  portfolioValue: number;
  onSelectAsset: (asset: TokenAsset) => void;
}) {
  return (
    <View>
      {/* Portfolio summary */}
      <View style={styles.portfolioHero}>
        <View style={styles.portfolioHeroIcon}>
          <MaterialCommunityIcons name="chart-areaspline" size={22} color="#fff" />
        </View>
        <View>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>{money(portfolioValue)}</Text>
        </View>
        <View style={styles.walletBal}>
          <Text style={styles.walletBalLabel}>Wallet</Text>
          <Text style={styles.walletBalAmt}>{money(walletBalance)}</Text>
        </View>
      </View>

      <View style={styles.assetListHeader}>
        <Text style={styles.sectionTitle}>Available Assets</Text>
        <Text style={styles.assetCount}>{tokenAssets.length} listed</Text>
      </View>

      {tokenAssets.map((asset) => {
        const holding = holdings.find((h) => h.assetId === asset.id);
        return (
          <Pressable key={asset.id} style={styles.assetCard} onPress={() => onSelectAsset(asset)}>
            <View style={styles.assetIcon}>
              <Ionicons
                name={asset.risk === "Low" ? "leaf-outline" : "business-outline"}
                size={20}
                color={colors.green}
              />
            </View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetMeta}>
                {asset.symbol} • {asset.assetType} • {asset.projectedYield}
              </Text>
            </View>
            <View style={styles.assetRight}>
              <Text style={styles.assetPrice}>{money(asset.unitPrice)}</Text>
              <Text style={styles.assetHeld}>{holding?.units ?? 0} units</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Asset Detail + Trade Screen ──────────────────────────────────────────────
function AssetDetailScreen({
  asset,
  walletBalance,
  heldUnits,
  onBack,
  onBuy,
  onSell,
}: {
  asset: TokenAsset;
  walletBalance: number;
  heldUnits: number;
  onBack: () => void;
  onBuy: (units: number) => { ok: boolean; message: string };
  onSell: (units: number) => { ok: boolean; message: string };
}) {
  const [unitsText, setUnitsText] = useState("1");
  const [confirmAction, setConfirmAction] = useState<"buy" | "sell" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ ok: boolean; message: string } | null>(null);

  const units = parseInt(unitsText, 10) || 0;
  const estimatedCost = units * asset.unitPrice;
  const canBuy = units > 0 && walletBalance >= estimatedCost;
  const canSell = units > 0 && heldUnits >= units;

  const riskColor = asset.risk === "Low" ? colors.success : colors.gold;

  const handleTrade = async (action: "buy" | "sell") => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = action === "buy" ? onBuy(units) : onSell(units);
    setProcessing(false);
    setConfirmAction(null);
    setResultMsg(result);
    if (result.ok) setUnitsText("1");
    setTimeout(() => setResultMsg(null), 3000);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Back header */}
      <View style={styles.assetDetailHeader}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.assetDetailTitle}>{asset.symbol}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero card */}
      <View style={styles.assetHeroCard}>
        <View style={styles.assetHeroTop}>
          <View style={styles.assetDetailIcon}>
            <Ionicons
              name={asset.risk === "Low" ? "leaf-outline" : "business-outline"}
              size={28}
              color={colors.green}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assetDetailName}>{asset.name}</Text>
            <Text style={styles.assetDetailIssuer}>{asset.issuer}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: riskColor + "20" }]}>
            <Text style={[styles.riskBadgeText, { color: riskColor }]}>{asset.risk} Risk</Text>
          </View>
        </View>

        <View style={styles.assetStatRow}>
          <View style={styles.assetStat}>
            <Text style={styles.assetStatLabel}>Unit Price</Text>
            <Text style={styles.assetStatValue}>{money(asset.unitPrice)}</Text>
          </View>
          <View style={styles.assetStat}>
            <Text style={styles.assetStatLabel}>Projected Yield</Text>
            <Text style={[styles.assetStatValue, { color: colors.green }]}>{asset.projectedYield}</Text>
          </View>
          <View style={styles.assetStat}>
            <Text style={styles.assetStatLabel}>You Hold</Text>
            <Text style={styles.assetStatValue}>{heldUnits} units</Text>
          </View>
        </View>

        <View style={styles.assetMetaGrid}>
          <View style={styles.assetMetaItem}>
            <Text style={styles.assetMetaLabel}>Asset Type</Text>
            <Text style={styles.assetMetaValue}>{asset.assetType}</Text>
          </View>
          <View style={styles.assetMetaItem}>
            <Text style={styles.assetMetaLabel}>Jurisdiction</Text>
            <Text style={styles.assetMetaValue}>{asset.jurisdiction}</Text>
          </View>
          <View style={styles.assetMetaItem}>
            <Text style={styles.assetMetaLabel}>Min. Investment</Text>
            <Text style={styles.assetMetaValue}>{money(asset.minimumInvestment)}</Text>
          </View>
          <View style={styles.assetMetaItem}>
            <Text style={styles.assetMetaLabel}>Reference ID</Text>
            <Text style={styles.assetMetaValue}>{asset.referenceId}</Text>
          </View>
        </View>
      </View>

      {/* Trade panel */}
      <View style={styles.tradePanel}>
        <Text style={styles.tradePanelTitle}>Trade {asset.symbol}</Text>

        <View style={styles.tradeInputRow}>
          <Text style={styles.tradeInputLabel}>Units</Text>
          <TextInput
            style={styles.tradeInput}
            value={unitsText}
            onChangeText={setUnitsText}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        <View style={styles.tradeEstimate}>
          <Text style={styles.tradeEstimateLabel}>Estimated value</Text>
          <Text style={styles.tradeEstimateValue}>{money(estimatedCost)}</Text>
        </View>

        <Text style={styles.tradeWalletHint}>Wallet: {money(walletBalance)}</Text>

        {resultMsg && (
          <View style={[styles.resultBanner, resultMsg.ok ? styles.resultBannerOk : styles.resultBannerErr]}>
            <Text style={styles.resultBannerText}>{resultMsg.message}</Text>
          </View>
        )}

        <View style={styles.tradeBtnRow}>
          <Pressable
            style={[styles.tradeBtn, styles.tradeBtnBuy, !canBuy && styles.tradeBtnDisabled]}
            onPress={() => canBuy && setConfirmAction("buy")}
          >
            <Text style={styles.tradeBtnText}>Buy</Text>
          </Pressable>
          <Pressable
            style={[styles.tradeBtn, styles.tradeBtnSell, !canSell && styles.tradeBtnDisabled]}
            onPress={() => canSell && setConfirmAction("sell")}
          >
            <Text style={[styles.tradeBtnText, { color: colors.green }]}>Sell</Text>
          </Pressable>
        </View>

        {!canBuy && units > 0 && walletBalance < estimatedCost && (
          <Text style={styles.tradeError}>Insufficient balance. Need {money(estimatedCost)}.</Text>
        )}
      </View>

      {/* Confirm modal */}
      <Modal visible={confirmAction !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => !processing && setConfirmAction(null)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              Confirm {confirmAction === "buy" ? "Purchase" : "Sale"}
            </Text>
            <Text style={styles.modalBody}>
              {confirmAction === "buy"
                ? `Buy ${units} ${asset.symbol} unit${units > 1 ? "s" : ""} for ${money(estimatedCost)} from your GrabPay wallet.`
                : `Sell ${units} ${asset.symbol} unit${units > 1 ? "s" : ""} for ${money(estimatedCost)} into your GrabPay wallet.`}
            </Text>
            <View style={styles.modalBtnRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => !processing && setConfirmAction(null)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => confirmAction && handleTrade(confirmAction)}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ── QR Scanner Mockup ────────────────────────────────────────────────────────
function ScannerMockup({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.scannerScreen}>
      <Text style={styles.scannerTitle}>Scan Merchant QR to Pay</Text>
      <Text style={styles.scannerSub}>Place the QR code within the frame</Text>
      <View style={styles.scannerFrame}>
        <View style={styles.scannerViewport}>
          <Ionicons name="qr-code" size={120} color="rgba(255,255,255,0.3)" />
          <View style={styles.scanLine} />
        </View>
      </View>
      <Pressable style={styles.cancelScanBtn} onPress={onClose}>
        <Text style={styles.cancelScanText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const MOCK_TXS = [
  { title: "Wallet Top-Up", sub: "Bank Transfer *8892 • 26 May", amount: "$30.00", isCredit: true },
  { title: "JustGrab Booking", sub: "Ride • 25 May, 04:32 PM", amount: "$14.50", isCredit: false },
  { title: "McBurger Supreme", sub: "Food Delivery • 24 May", amount: "$22.80", isCredit: false },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.textDark },
  tabToggle: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: radius.md,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: radius.sm },
  tabBtnActive: { backgroundColor: colors.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: colors.textGray },
  tabBtnTextActive: { color: colors.textDark, fontWeight: "700" },

  // Virtual card
  cardContainer: { paddingHorizontal: 16, marginBottom: 12 },
  virtualCard: { borderRadius: radius.xl, padding: 20, height: 200, justifyContent: "space-between" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTier: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  platinumBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  platinumText: { fontSize: 10, fontWeight: "800", color: colors.gold },
  cardBalLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  cardBalance: { fontSize: 28, fontWeight: "800", color: "#fff" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { fontSize: 13, color: "rgba(255,255,255,0.8)", letterSpacing: 2, fontWeight: "500" },
  cardPoints: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardPointsText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Top up
  sectionCard: { backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 12, borderRadius: radius.md, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sectionCardTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark, marginBottom: 12 },
  topUpRow: { flexDirection: "row", gap: 8 },
  topUpBtn: { flex: 1, backgroundColor: colors.greenLight, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  topUpBtnText: { fontSize: 13, fontWeight: "700", color: colors.green },

  // Rewards
  rewardsTierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rewardsLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rewardsTierIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  rewardsTierTitle: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  rewardsTierTarget: { fontSize: 11, fontWeight: "600", color: colors.textGray },
  progressTrack: { height: 8, backgroundColor: "#F2F4F7", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: colors.gold, borderRadius: 4 },
  rewardsHint: { fontSize: 11, color: colors.textGray, lineHeight: 16 },

  // Invest CTA
  investCta: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 12, borderRadius: radius.md, padding: 14, gap: 12, borderLeftWidth: 3, borderLeftColor: colors.green, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  investCtaCopy: { flex: 1 },
  investCtaTitle: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  investCtaSub: { fontSize: 11, color: colors.textGray, marginTop: 1 },

  // Transactions
  divider: { height: 1, backgroundColor: "#F2F4F7", marginVertical: 4 },
  txRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 12 },
  txIconBg: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 13, fontWeight: "700", color: colors.textDark },
  txSub: { fontSize: 11, color: colors.textGray },
  txAmount: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  txAmountCredit: { color: colors.success },

  // Scan button
  scanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.green, marginHorizontal: 16, marginTop: 4, borderRadius: radius.lg, paddingVertical: 14, gap: 8, shadowColor: colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Token Assets list
  portfolioHero: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: radius.lg, padding: 16, gap: 12, marginBottom: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  portfolioHeroIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  portfolioLabel: { fontSize: 11, color: colors.textGray },
  portfolioValue: { fontSize: 22, fontWeight: "800", color: colors.textDark },
  walletBal: { marginLeft: "auto" as any, alignItems: "flex-end" },
  walletBalLabel: { fontSize: 10, color: colors.textGray },
  walletBalAmt: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  assetListHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  assetCount: { fontSize: 12, color: colors.green, fontWeight: "600" },
  assetCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 8, borderRadius: radius.md, padding: 14, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  assetIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenLight, alignItems: "center", justifyContent: "center" },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 13, fontWeight: "700", color: colors.textDark },
  assetMeta: { fontSize: 11, color: colors.textGray, marginTop: 1 },
  assetRight: { alignItems: "flex-end" },
  assetPrice: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  assetHeld: { fontSize: 11, color: colors.textGray },

  // Asset detail
  assetDetailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  assetDetailTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark },
  assetHeroCard: { backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 12, borderRadius: radius.lg, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  assetHeroTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  assetDetailIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.greenLight, alignItems: "center", justifyContent: "center" },
  assetDetailName: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  assetDetailIssuer: { fontSize: 12, color: colors.textGray, marginTop: 2 },
  riskBadge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  riskBadgeText: { fontSize: 11, fontWeight: "700" },
  assetStatRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginBottom: 14 },
  assetStat: { flex: 1, alignItems: "center" },
  assetStatLabel: { fontSize: 10, color: colors.textGray, marginBottom: 3 },
  assetStatValue: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  assetMetaGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 0 },
  assetMetaItem: { width: "50%", paddingVertical: 6, paddingRight: 8 },
  assetMetaLabel: { fontSize: 10, color: colors.textGray, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.3 },
  assetMetaValue: { fontSize: 12, fontWeight: "600", color: colors.textDark },

  // Trade panel
  tradePanel: { backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 12, borderRadius: radius.lg, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  tradePanelTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 16 },
  tradeInputRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  tradeInputLabel: { fontSize: 14, fontWeight: "600", color: colors.textGray },
  tradeInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 9, fontSize: 16, fontWeight: "700", color: colors.textDark, minWidth: 100, textAlign: "right" },
  tradeEstimate: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderRadius: radius.sm, padding: 12, marginBottom: 6 },
  tradeEstimateLabel: { fontSize: 12, color: colors.textGray },
  tradeEstimateValue: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  tradeWalletHint: { fontSize: 11, color: colors.textGray, marginBottom: 12, textAlign: "right" },
  tradeBtnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  tradeBtn: { flex: 1, paddingVertical: 13, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  tradeBtnBuy: { backgroundColor: colors.green },
  tradeBtnSell: { backgroundColor: colors.greenLight, borderWidth: 1.5, borderColor: colors.green },
  tradeBtnDisabled: { opacity: 0.4 },
  tradeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  tradeError: { fontSize: 11, color: colors.danger, marginTop: 8, textAlign: "center" },
  resultBanner: { borderRadius: radius.sm, padding: 10, marginBottom: 10 },
  resultBannerOk: { backgroundColor: colors.greenLight },
  resultBannerErr: { backgroundColor: "#FEE2E2" },
  resultBannerText: { fontSize: 12, fontWeight: "600", color: colors.textDark, textAlign: "center" },

  // Confirm modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.textDark, marginBottom: 12 },
  modalBody: { fontSize: 14, color: colors.textGray, lineHeight: 20, marginBottom: 24 },
  modalBtnRow: { flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: radius.lg, alignItems: "center" },
  modalBtnCancel: { backgroundColor: "#F1F5F9" },
  modalBtnCancelText: { fontWeight: "700", color: colors.textGray, fontSize: 15 },
  modalBtnConfirm: { backgroundColor: colors.green },
  modalBtnConfirmText: { fontWeight: "700", color: "#fff", fontSize: 15 },

  // Scanner
  scannerScreen: { flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center", padding: 24 },
  scannerTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 6 },
  scannerSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32 },
  scannerFrame: { borderRadius: radius.lg, overflow: "hidden", marginBottom: 32 },
  scannerViewport: { width: 260, height: 260, backgroundColor: "#1E1E1E", borderRadius: radius.lg, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  scanLine: { position: "absolute", width: "100%", height: 2, backgroundColor: colors.green, top: "40%" },
  cancelScanBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: radius.lg, paddingHorizontal: 28, paddingVertical: 12 },
  cancelScanText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
