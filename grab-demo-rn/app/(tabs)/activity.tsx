import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../constants/theme";
import { money } from "../../src/domain/format";
import { useGrab } from "../../src/state/GrabProvider";
import type { ActiveOrder } from "../../src/domain/types";

export default function ActivityScreen() {
  const { state } = useGrab();
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {state.activeOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active orders</Text>
          {state.activeOrders.map((order) => (
            <Pressable key={order.id} style={styles.orderCard} onPress={() => router.push("/order-tracking")}>
              <OrderCardContent order={order} isActive />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past orders</Text>
        {state.pastOrders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyText}>No past orders yet</Text>
          </View>
        ) : (
          state.pastOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <OrderCardContent order={order} isActive={false} />
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function OrderCardContent({ order, isActive }: { order: ActiveOrder; isActive: boolean }) {
  return (
    <View style={styles.orderRow}>
      <View style={[styles.orderIconBg, isActive && styles.orderIconBgActive]}>
        <Ionicons
          name={order.type === "RIDE" ? "car-outline" : "restaurant-outline"}
          size={20}
          color={isActive ? colors.green : colors.textGray}
        />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle}>{order.title}</Text>
        <Text style={styles.orderSubtitle}>{order.subtitle}</Text>
        {isActive && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${order.progress * 100}%` as any }]} />
          </View>
        )}
        <Text style={[styles.orderStatus, isActive && styles.orderStatusActive]}>{order.statusText}</Text>
      </View>
      <Text style={styles.orderCost}>{money(order.cost)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 10 },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  orderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  orderIconBgActive: { backgroundColor: colors.greenLight },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  orderSubtitle: { fontSize: 11, color: colors.textGray, marginTop: 1 },
  progressTrack: {
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: colors.green, borderRadius: 2 },
  orderStatus: { fontSize: 11, color: colors.textGray, marginTop: 4 },
  orderStatusActive: { color: colors.green, fontWeight: "700" },
  orderCost: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: colors.textLight },
});
