import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";
import { money } from "../../src/domain/format";
import { useWallet } from "../../src/state/WalletProvider";

const primaryActions = [
  { label: "Apply", icon: "card-account-details-outline" },
  { label: "Cash flow", icon: "chart-pie" },
  { label: "Transfer", icon: "navigation-variant-outline" },
  { label: "Cards", icon: "card-outline" },
] as const;

const recommended = [
  { label: "Komunity", icon: "account-group-outline" },
  { label: "Currency Co...", icon: "currency-usd" },
  { label: "Visa Card", icon: "cards-outline" },
] as const;

const favourites = [
  { label: "Travel", icon: "bag-suitcase-outline" },
  { label: "Trips", icon: "cart-outline" },
  { label: "Rewards", icon: "cash-fast" },
] as const;

export default function DashboardScreen() {
  const { state, store } = useWallet();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.blueHeader}>
        <View style={styles.topRow}>
          <View style={styles.countryPill}>
            <View style={styles.flagBadge}>
              <Text style={styles.flagMoon}>◒</Text>
            </View>
            <Text style={styles.flag}>MY</Text>
            <View style={styles.countryArt}>
              <View style={styles.palmStem} />
              <View style={styles.palmLeafLeft} />
              <View style={styles.palmLeafRight} />
              <View style={styles.towerOne} />
              <View style={styles.towerTwo} />
            </View>
          </View>
          <View style={styles.search}>
            <Ionicons name="search" size={15} color="#A5B4C8" />
            <Text style={styles.searchText}>BUDI95</Text>
          </View>
          <Pressable style={styles.profileButton} onPress={() => store.showEventMessage("Profile opened")}>
            <Ionicons name="person" size={19} color={colors.blue} />
            <View style={styles.profileDot} />
            <View style={styles.profileCoin} />
          </Pressable>
        </View>

        <View style={styles.balanceBlock}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={15} color="#D8EBFF" />
          </View>
          <Text style={styles.balance}>{money(state.wallet.balance)}</Text>
          <Ionicons name="eye-outline" size={24} color="#BFE1FF" />
        </View>
        <Pressable style={styles.assetLink} onPress={() => store.showEventMessage("Asset details opened")}>
          <Text style={styles.assetText}>View asset details</Text>
          <Ionicons name="chevron-forward" size={16} color="#77BDFB" />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.addMoney} onPress={() => store.reloadWallet(20)}>
            <Ionicons name="add" size={16} color="#EAF6FF" />
            <Text style={styles.addMoneyText}>Add money</Text>
          </Pressable>
          <Pressable style={styles.transactions} onPress={() => store.showEventMessage("Transactions opened")}>
            <Text style={styles.transactionsText}>Transactions</Text>
            <Ionicons name="chevron-forward" size={16} color="#EAF6FF" />
          </Pressable>
        </View>
      </View>

      <View style={styles.actionTray}>
        {primaryActions.map((action) => (
          <Pressable
            key={action.label}
            style={styles.actionItem}
            onPress={() => store.showEventMessage(`${action.label} opened`)}
          >
            <MaterialCommunityIcons name={action.icon} size={33} color="#1269A9" />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.tilesGrid}>
        <InfoTile
          icon="sprout"
          title="Grow your money"
          subtitle="Start with just RM10"
          color="#F8C51C"
        />
        <InfoTile
          icon="fuel"
          title="BUDI95"
          subtitle="RON95 at RM1.99"
          color="#2596D3"
        />
        <InfoTile
          icon="gift-outline"
          title="GOrewards"
          subtitle={`${state.wallet.rewardPoints.toLocaleString()} pts`}
          color="#F7C700"
          badge="Join now"
        />
        <View style={styles.fuelTile}>
          <View style={styles.fuelCopy}>
            <Text style={styles.tileTitle}>Fuel balance</Text>
            <Text style={styles.fuelAmount}>21 litres</Text>
          </View>
          <View style={styles.fuelGauge}>
            <MaterialCommunityIcons name="fuel" size={22} color={colors.blue} />
          </View>
        </View>
      </View>

      <LinearGradient colors={["#F2AE12", "#F9C82C", "#FFE061"]} style={styles.banner}>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerBrand}>ASNB</Text>
          <Text style={styles.bannerText}>Tambah{"\n"}simpanan anda{"\n"}sehingga{"\n"}5+5% p.a.</Text>
          <Text style={styles.bannerSub}>Aktifkan AutoLabur</Text>
        </View>
        <View style={styles.bannerVisual}>
          <View style={styles.cardStackBack} />
          <View style={styles.cardStackFront} />
          <View style={styles.bannerBubble}>
            <Text style={styles.bannerRate}>5+5%</Text>
            <Text style={styles.bannerRateSub}>p.a.</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.sectionTitle}>Recommended</Text>
      <View style={styles.shortcutRow}>
        {recommended.map((item) => (
          <Shortcut key={item.label} label={item.label} icon={item.icon} />
        ))}
        <Pressable style={styles.shakeBadge} onPress={() => store.addRewardsPoints(8)}>
          <Text style={styles.shakeText}>SHAKE</Text>
        </Pressable>
      </View>

      <View style={styles.favHeader}>
        <Text style={styles.sectionTitle}>My Favourites</Text>
        <Text style={styles.edit}>Edit</Text>
      </View>
      <View style={styles.shortcutRow}>
        {favourites.map((item) => (
          <Shortcut key={item.label} label={item.label} icon={item.icon} />
        ))}
      </View>
    </ScrollView>
  );
}

function InfoTile({
  icon,
  title,
  subtitle,
  color,
  badge,
  imageLike,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  badge?: string;
  imageLike?: boolean;
}) {
  return (
    <Pressable style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: `${color}24` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.tileCopy}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSub}>{subtitle}</Text>
        {badge ? (
          <View style={styles.tileBadge}>
            <Text style={styles.tileBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function Shortcut({
  label,
  icon,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Pressable style={styles.shortcut}>
      <MaterialCommunityIcons name={icon} size={34} color="#1269A9" />
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7FAFE",
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  blueHeader: {
    backgroundColor: colors.blue,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingBottom: 58,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  countryPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 18,
    flexDirection: "row",
    height: 38,
    overflow: "hidden",
    paddingLeft: 4,
    width: 110,
  },
  flagBadge: {
    alignItems: "center",
    backgroundColor: "#173B83",
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: "center",
    width: 31,
  },
  flagMoon: {
    color: "#FFE15A",
    fontSize: 13,
    fontWeight: "900",
  },
  flag: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 5,
  },
  countryArt: {
    backgroundColor: "#8EC5D8",
    borderRadius: 16,
    height: 32,
    marginLeft: 7,
    overflow: "hidden",
    position: "relative",
    width: 42,
  },
  palmStem: {
    backgroundColor: "#6B4E2E",
    bottom: 4,
    height: 22,
    left: 13,
    position: "absolute",
    transform: [{ rotate: "8deg" }],
    width: 3,
  },
  palmLeafLeft: {
    backgroundColor: "#2F9E53",
    borderRadius: 8,
    height: 10,
    left: 4,
    position: "absolute",
    top: 7,
    transform: [{ rotate: "-28deg" }],
    width: 18,
  },
  palmLeafRight: {
    backgroundColor: "#42B768",
    borderRadius: 8,
    height: 10,
    left: 14,
    position: "absolute",
    top: 7,
    transform: [{ rotate: "28deg" }],
    width: 18,
  },
  towerOne: {
    backgroundColor: "#1C526C",
    bottom: 0,
    height: 24,
    position: "absolute",
    right: 8,
    width: 6,
  },
  towerTwo: {
    backgroundColor: "#174559",
    bottom: 0,
    height: 29,
    position: "absolute",
    right: 1,
    width: 7,
  },
  search: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
  },
  searchText: {
    color: "#59677A",
    fontSize: 14,
    fontWeight: "800",
  },
  profileButton: {
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  profileDot: {
    backgroundColor: "#F43F5E",
    borderRadius: 5,
    height: 10,
    position: "absolute",
    right: 0,
    top: 0,
    width: 10,
  },
  profileCoin: {
    backgroundColor: colors.yellow,
    borderColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    bottom: 0,
    height: 12,
    position: "absolute",
    right: 0,
    width: 12,
  },
  balanceBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 28,
  },
  checkCircle: {
    alignItems: "center",
    borderColor: "#82C8FF",
    borderRadius: 15,
    borderStyle: "dashed",
    borderWidth: 1.4,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  balance: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: "500",
  },
  assetLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
  },
  assetText: {
    color: "#77BDFB",
    fontSize: 14,
    fontWeight: "700",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 26,
    marginTop: 20,
  },
  addMoney: {
    alignItems: "center",
    borderColor: "#BFE1FF",
    borderRadius: 22,
    borderWidth: 1.6,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  addMoneyText: {
    color: "#EAF6FF",
    fontSize: 16,
    fontWeight: "800",
  },
  transactions: {
    alignItems: "center",
    flexDirection: "row",
  },
  transactionsText: {
    color: "#EAF6FF",
    fontSize: 16,
    fontWeight: "800",
  },
  actionTray: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: -44,
    paddingHorizontal: 22,
    paddingVertical: 18,
    shadowColor: "#0E2A4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  actionItem: {
    alignItems: "center",
    gap: 9,
  },
  actionLabel: {
    color: "#2D3748",
    fontSize: 13,
    fontWeight: "600",
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 18,
    marginTop: 18,
  },
  tile: {
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    borderRadius: 12,
    flexBasis: "48.5%",
    flexDirection: "row",
    minHeight: 86,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tileIcon: {
    alignItems: "center",
    borderRadius: 17,
    flexShrink: 0,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  tileCopy: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  tileTitle: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
  },
  tileSub: {
    color: "#516276",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    marginTop: 4,
  },
  tileBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.blue,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tileBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
  fuelTile: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexBasis: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 86,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fuelCopy: {
    flex: 1,
    minWidth: 0,
  },
  fuelAmount: {
    color: "#263548",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
    marginTop: 5,
  },
  fuelGauge: {
    alignItems: "center",
    borderColor: "#A7D4FF",
    borderRadius: 22,
    borderWidth: 2,
    flexShrink: 0,
    height: 44,
    justifyContent: "center",
    marginLeft: 8,
    width: 44,
  },
  banner: {
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 16,
    minHeight: 148,
    overflow: "hidden",
    paddingBottom: 16,
    paddingLeft: 18,
    paddingRight: 14,
    paddingTop: 16,
  },
  bannerCopy: {
    flex: 1,
    paddingRight: 8,
  },
  bannerBrand: {
    color: "#087444",
    fontSize: 13,
    fontWeight: "900",
  },
  bannerText: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
    marginTop: 4,
  },
  bannerSub: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  bannerVisual: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    position: "relative",
    width: 112,
  },
  bannerBubble: {
    alignItems: "center",
    backgroundColor: "#1477DB",
    borderRadius: 43,
    height: 86,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 33,
    transform: [{ rotate: "-8deg" }],
    width: 86,
  },
  bannerRate: {
    color: colors.surface,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 28,
  },
  bannerRateSub: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  cardStackBack: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
    height: 56,
    position: "absolute",
    right: 32,
    top: 54,
    transform: [{ rotate: "-10deg" }],
    width: 42,
  },
  cardStackFront: {
    backgroundColor: "#2A8DEB",
    borderRadius: 10,
    height: 62,
    position: "absolute",
    right: 24,
    top: 47,
    transform: [{ rotate: "10deg" }],
    width: 46,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 14,
  },
  dot: {
    backgroundColor: "#C5CED9",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.blue,
    width: 20,
  },
  sectionTitle: {
    color: "#252F3F",
    fontSize: 18,
    fontWeight: "900",
    marginHorizontal: 18,
    marginTop: 22,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 18,
    marginTop: 14,
  },
  shortcut: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  shortcutLabel: {
    color: "#2F3B4D",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  shakeBadge: {
    alignItems: "center",
    backgroundColor: "#EF6A43",
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 14,
  },
  shakeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  favHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  edit: {
    color: "#2489E5",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 22,
  },
});
