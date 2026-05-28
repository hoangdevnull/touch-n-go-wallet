import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";
import { money } from "../../src/domain/format";
import { restaurants } from "../../src/domain/assets";
import { useGrab } from "../../src/state/GrabProvider";
import {
  IconExpress,
  IconFood,
  IconGift,
  IconMart,
  IconMore,
  IconOffer,
  IconTransport,
} from "../../components/GrabIcons";

// ── Service tile data — matches Figma node 35:848 order ────────────────────
type ServiceItem = {
  label: string;
  route: string | null;
  Icon: React.ComponentType<{ size?: number }>;
};

const SERVICES: ServiceItem[] = [
  { label: "Food",       Icon: IconFood,      route: "/food" },
  { label: "Mart",       Icon: IconMart,      route: null },
  { label: "Express",    Icon: IconExpress,   route: null },
  { label: "Transport",  Icon: IconTransport, route: "/ride-booking" },
  { label: "Offers",     Icon: IconOffer,     route: null },
  { label: "Gift Cards", Icon: IconGift,      route: null },
  { label: "Finance",    Icon: IconGift,      route: "/(tabs)/payment" },
  { label: "More",       Icon: IconMore,      route: null },
];

// ── Promo strip ─────────────────────────────────────────────────────────────
const PROMOS = [
  { title: "20% off rides", sub: "Use code GRABGO", color: "#E8F5E9" },
  { title: "Free delivery", sub: "First 3 GrabFood orders", color: "#FFF8E1" },
  { title: "3× reward pts", sub: "All GrabPay transactions", color: "#EDE7F6" },
  { title: "Flash deal", sub: "GrabMart RM5 off", color: "#FCE4EC" },
];

export default function HomeScreen() {
  const { state, store } = useGrab();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top navigation bar ─────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable style={styles.scanBtn}>
          <Ionicons name="scan-outline" size={22} color={colors.textDark} />
        </Pressable>

        <Pressable style={styles.searchPill} onPress={() => router.push("/ride-booking")}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <Text style={styles.searchPillText}>Where to?</Text>
        </Pressable>

        <Pressable
          style={styles.gPointsBtn}
          onPress={() => router.push("/(tabs)/payment")}
        >
          <Text style={styles.gPointsText}>G</Text>
        </Pressable>

        <Pressable style={styles.avatarBtn} onPress={() => router.push("/(tabs)/account")}>
          <Ionicons name="person" size={18} color="#fff" />
          <View style={styles.avatarBadge} />
        </Pressable>
      </View>

      {/* ── Active order ticker ─────────────────────────────────────────── */}
      {state.activeOrders.length > 0 && (
        <Pressable style={styles.activeTicker} onPress={() => router.push("/order-tracking")}>
          <View style={styles.activeTickerDot} />
          <Text style={styles.activeTickerText} numberOfLines={1}>
            {state.activeOrders[0].statusText} — {state.activeOrders[0].title}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.green} />
        </Pressable>
      )}

      {/* ── Service grid ────────────────────────────────────────────────── */}
      <View style={styles.serviceGrid}>
        {SERVICES.map((svc) => (
          <Pressable
            key={svc.label}
            style={styles.serviceTile}
            onPress={() => {
              if (svc.route) router.push(svc.route as any);
              else store.showAnnouncement(`${svc.label} is a preview — not implemented in this demo.`);
            }}
          >
            <View style={styles.serviceIconBox}>
              <svc.Icon size={52} />
            </View>
            <Text style={styles.serviceLabel}>{svc.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Quick-action cards (GrabPay + Rewards) ──────────────────────── */}
      <View style={styles.quickRow}>
        <Pressable style={styles.quickCard} onPress={() => router.push("/(tabs)/payment")}>
          <View style={styles.quickCardLeft}>
            <Text style={styles.quickCardLabel}>GrabPay</Text>
            <Text style={styles.quickCardValue}>{money(state.balance)}</Text>
          </View>
          <View style={styles.quickCardIcon}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color={colors.green} />
          </View>
        </Pressable>

        <Pressable style={styles.quickCard} onPress={() => store.showAnnouncement("GrabRewards: redeem points for exclusive perks and discounts.")}>
          <View style={styles.quickCardLeft}>
            <Text style={styles.quickCardLabel}>Rewards</Text>
            <Text style={styles.quickCardValue}>{state.rewardsPoints.toLocaleString()} pts</Text>
          </View>
          <View style={styles.quickCardIcon}>
            <Ionicons name="star-outline" size={20} color={colors.gold} />
          </View>
        </Pressable>
      </View>

      {/* ── Promo horizontal scroll ──────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers for you</Text>
          <Pressable style={styles.seeAllBtn}>
            <Ionicons name="chevron-forward" size={16} color={colors.textGray} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoRow}>
          {PROMOS.map((p) => (
            <Pressable
              key={p.title}
              style={[styles.promoChip, { backgroundColor: p.color }]}
              onPress={() => store.showAnnouncement(`${p.title}: ${p.sub}`)}
            >
              <Text style={styles.promoChipTitle}>{p.title}</Text>
              <Text style={styles.promoChipSub}>{p.sub}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Invest banner ───────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Pressable onPress={() => router.push("/(tabs)/payment")}>
          <LinearGradient
            colors={[colors.green, colors.greenDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.investBanner}
          >
            <View style={styles.investBannerCircle} />
            <View style={styles.investBannerCircle2} />
            <View style={styles.investBannerBody}>
              <View style={styles.investBadge}>
                <Text style={styles.investBadgeText}>NEW</Text>
              </View>
              <Text style={styles.investBannerTitle}>GrabPay Token Investments</Text>
              <Text style={styles.investBannerSub}>Earn up to 12% p.a. on idle balance</Text>
            </View>
            <View style={styles.investBannerRight}>
              <MaterialCommunityIcons name="chart-line-variant" size={48} color="rgba(255,255,255,0.25)" />
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── GrabFood restaurants ─────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GrabFood near you</Text>
          <Pressable style={styles.seeAllBtn} onPress={() => router.push("/food")}>
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.green} />
          </Pressable>
        </View>

        {restaurants.map((r) => (
          <Pressable
            key={r.id}
            style={styles.restaurantCard}
            onPress={() => {
              store.selectRestaurant(r);
              router.push("/food");
            }}
          >
            <LinearGradient
              colors={[r.bannerColorStart, r.bannerColorEnd]}
              style={styles.restaurantBanner}
            >
              {r.promoLabel ? (
                <View style={styles.restPromo}>
                  <Text style={styles.restPromoText}>{r.promoLabel}</Text>
                </View>
              ) : null}
              <View style={styles.restaurantRatingBubble}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.restaurantRatingText}>{r.rating}</Text>
              </View>
            </LinearGradient>
            <View style={styles.restaurantBody}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.restaurantMeta}>{r.category}</Text>
              <View style={styles.restaurantMetaRow}>
                <Ionicons name="time-outline" size={11} color="#9CA3AF" />
                <Text style={styles.restaurantMetaText}>{r.deliveryTime}</Text>
                <View style={styles.metaDot} />
                <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                <Text style={styles.restaurantMetaText}>{r.distance}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.restaurantDeliveryFee}>Delivery {money(r.deliveryFee)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* ── Chat banner ──────────────────────────────────────────────────── */}
      <Pressable
        style={styles.chatBanner}
        onPress={() => store.showAnnouncement("In-app chat is not implemented in this demo.")}
      >
        <View style={styles.chatBannerLeft}>
          <Text style={styles.chatBannerTitle}>Chat, book, share on Grab!</Text>
          <Text style={styles.chatBannerSub}>Connect with drivers and friends</Text>
        </View>
        <Ionicons name="chatbubble-ellipses" size={36} color={colors.green} style={{ opacity: 0.6 }} />
      </Pressable>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: {},

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#fff",
    gap: 8,
  },
  scanBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchPillText: { fontSize: 14, color: "#9CA3AF" },
  gPointsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  gPointsText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  // Active ticker
  activeTicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
  },
  activeTickerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  activeTickerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.textDark },

  // Services
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  serviceTile: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 10,
    gap: 6,
  },
  serviceIconBox: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: { fontSize: 11.5, color: "#374151", fontWeight: "500", textAlign: "center" },

  // Quick cards
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 10,
  },
  quickCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickCardLeft: { flex: 1 },
  quickCardLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  quickCardValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  quickCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  // Section
  section: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, color: colors.green, fontWeight: "600" },

  // Promos
  promoRow: { gap: 8, paddingBottom: 4 },
  promoChip: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: 160,
  },
  promoChipTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 3 },
  promoChipSub: { fontSize: 11, color: "#6B7280", lineHeight: 15 },

  // Invest banner
  investBanner: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 90,
  },
  investBannerCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.07)",
    right: 40,
    top: -30,
  },
  investBannerCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    right: -10,
    bottom: -20,
  },
  investBannerBody: { flex: 1 },
  investBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  investBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  investBannerTitle: { color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  investBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  investBannerRight: { marginLeft: 8 },

  // Restaurants
  restaurantCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantBanner: { height: 130 },
  restPromo: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  restPromoText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  restaurantRatingBubble: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  restaurantRatingText: { fontSize: 11, fontWeight: "700", color: "#111827" },
  restaurantBody: { paddingHorizontal: 14, paddingVertical: 12 },
  restaurantName: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 3 },
  restaurantMeta: { fontSize: 11.5, color: "#9CA3AF", marginBottom: 6 },
  restaurantMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  restaurantMetaText: { fontSize: 11, color: "#9CA3AF" },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#D1D5DB" },
  restaurantDeliveryFee: { fontSize: 11, color: "#6B7280", fontWeight: "500" },

  // Chat banner
  chatBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chatBannerLeft: { flex: 1 },
  chatBannerTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 3 },
  chatBannerSub: { fontSize: 11.5, color: "#6B7280" },
});
