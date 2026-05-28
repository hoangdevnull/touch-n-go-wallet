import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";
import { restaurants } from "../src/domain/assets";
import { money } from "../src/domain/format";
import { useGrab } from "../src/state/GrabProvider";
import type { MenuItem } from "../src/domain/types";

export default function FoodScreen() {
  const { state, store } = useGrab();
  const router = useRouter();
  const selectedRestaurant = state.selectedRestaurant;

  if (selectedRestaurant) {
    const cartTotal = store.getCartTotal();
    const cartCount = Object.values(state.cart).reduce((s, i) => s + i.count, 0);
    const categories = Array.from(new Set(selectedRestaurant.menu.map((m) => m.category)));

    const handleCheckout = () => {
      store.checkoutFood();
      router.push("/order-tracking");
    };

    return (
      <View style={styles.screen}>
        {/* Restaurant header */}
        <View>
          <LinearGradient
            colors={[selectedRestaurant.bannerColorStart, selectedRestaurant.bannerColorEnd]}
            style={styles.restaurantHeader}
          >
            <Pressable style={styles.backBtn} onPress={() => store.deselectRestaurant()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
          </LinearGradient>
          <View style={styles.restaurantInfoCard}>
            <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
            <Text style={styles.restaurantMeta}>{selectedRestaurant.category}</Text>
            <View style={styles.restaurantMetaRow}>
              <Ionicons name="star" size={12} color={colors.gold} />
              <Text style={styles.ratingText}>{selectedRestaurant.rating}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.restaurantMeta}>{selectedRestaurant.deliveryTime}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.restaurantMeta}>{selectedRestaurant.distance}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.restaurantMeta}>Delivery: {money(selectedRestaurant.deliveryFee)}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {categories.map((category) => (
            <View key={category} style={styles.menuCategory}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {selectedRestaurant.menu
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItemRow key={item.name} item={item} cartItem={state.cart[item.name]} store={store} />
                ))}
            </View>
          ))}
        </ScrollView>

        {/* Cart footer */}
        {cartCount > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.cartSummary}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
              <Text style={styles.cartTotal}>{money(cartTotal + selectedRestaurant.deliveryFee)}</Text>
            </View>
            <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>GrabFood</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionTitle}>Restaurants near you</Text>
        {restaurants.map((r) => (
          <Pressable
            key={r.id}
            style={styles.restaurantCard}
            onPress={() => store.selectRestaurant(r)}
          >
            <LinearGradient colors={[r.bannerColorStart, r.bannerColorEnd]} style={styles.cardBanner}>
              {r.promoLabel ? (
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>{r.promoLabel}</Text>
                </View>
              ) : null}
            </LinearGradient>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{r.name}</Text>
              <Text style={styles.cardMeta}>{r.category}</Text>
              <View style={styles.cardMetaRow}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <Text style={styles.ratingText}>{r.rating}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.cardMeta}>{r.deliveryTime}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.cardMeta}>{r.distance}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function MenuItemRow({
  item,
  cartItem,
  store,
}: {
  item: MenuItem;
  cartItem: { count: number } | undefined;
  store: ReturnType<typeof useGrab>["store"];
}) {
  return (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.menuItemPrice}>{money(item.price)}</Text>
      </View>
      <View style={styles.menuItemActions}>
        {cartItem ? (
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => store.removeFromCart(item)}>
              <Ionicons name="remove" size={16} color={colors.green} />
            </Pressable>
            <Text style={styles.stepCount}>{cartItem.count}</Text>
            <Pressable style={styles.stepBtn} onPress={() => store.addToCart(item)}>
              <Ionicons name="add" size={16} color={colors.green} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addBtn} onPress={() => store.addToCart(item)}>
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.textDark },
  listContent: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 12 },
  restaurantCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBanner: { height: 100 },
  promoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  promoBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  cardInfo: { padding: 12 },
  cardName: { fontSize: 15, fontWeight: "700", color: colors.textDark, marginBottom: 2 },
  cardMeta: { fontSize: 11, color: colors.textGray },
  cardMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  ratingText: { fontSize: 11, fontWeight: "700", color: colors.textDark },
  dot: { color: colors.textLight, fontSize: 11 },
  restaurantHeader: { height: 160 },
  restaurantInfoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  restaurantName: { fontSize: 18, fontWeight: "800", color: colors.textDark, marginBottom: 2 },
  restaurantMeta: { fontSize: 12, color: colors.textGray },
  restaurantMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 6, flexWrap: "wrap", gap: 4 },
  menuCategory: { paddingHorizontal: 16, paddingTop: 20 },
  categoryTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: colors.green, paddingLeft: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemEmoji: { fontSize: 32 },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 13, fontWeight: "700", color: colors.textDark, marginBottom: 2 },
  menuItemDesc: { fontSize: 11, color: colors.textGray, lineHeight: 15, marginBottom: 4 },
  menuItemPrice: { fontSize: 14, fontWeight: "700", color: colors.green },
  menuItemActions: { alignItems: "center" },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCount: { fontSize: 14, fontWeight: "700", color: colors.textDark, minWidth: 16, textAlign: "center" },
  cartFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: 16,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cartSummary: { flexDirection: "row", alignItems: "center", gap: 8 },
  cartBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  cartTotal: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  checkoutBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.green, borderRadius: radius.lg, paddingVertical: 14, gap: 6 },
  checkoutBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
