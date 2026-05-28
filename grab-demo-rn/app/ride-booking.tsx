import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../constants/theme";
import { rideServices } from "../src/domain/assets";
import { money } from "../src/domain/format";
import { useGrab } from "../src/state/GrabProvider";

export default function RideBookingScreen() {
  const { state, store } = useGrab();
  const router = useRouter();
  const selectedId = state.selectedRideServiceId;

  const handleConfirm = () => {
    store.confirmRide(state.selectedRideServiceId === "justgrab" ? "Orchard Towers Terminal" : "Selected Destination");
    router.push("/order-tracking");
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="rgba(255,255,255,0.4)" />
          <Text style={styles.mapText}>Live map preview</Text>
          <View style={styles.pickupMarker}>
            <View style={styles.markerDot} />
          </View>
        </View>

        {/* Route inputs */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routeDotGreen} />
            <View style={styles.routeInputContainer}>
              <Text style={styles.routeInputLabel}>Pickup</Text>
              <Text style={styles.routeInputValue}>Your Current Location (Marina Bay)</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={styles.routeDotRed} />
            <View style={styles.routeInputContainer}>
              <Text style={styles.routeInputLabel}>Destination</Text>
              <TextInput
                style={styles.routeTextInput}
                placeholder="Where to?"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* Service options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a service</Text>
          {rideServices.map((service) => {
            const isSelected = selectedId === service.id;
            return (
              <Pressable
                key={service.id}
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => store.selectRideService(service.id)}
              >
                <View style={[styles.serviceIconBg, isSelected && styles.serviceIconBgSelected]}>
                  <Ionicons name={service.icon as any} size={24} color={isSelected ? colors.surface : colors.textGray} />
                </View>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.typeName}</Text>
                    {service.seatCount > 1 && (
                      <View style={styles.seatBadge}>
                        <Ionicons name="people-outline" size={11} color={colors.textGray} />
                        <Text style={styles.seatCount}>{service.seatCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <Text style={styles.serviceDuration}>{service.durationMin} min away</Text>
                </View>
                <View style={styles.serviceFareRight}>
                  <Text style={styles.serviceFare}>{money(service.baseFare)}</Text>
                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Promo code */}
        <View style={styles.promoRow}>
          <Ionicons name="pricetag-outline" size={16} color={colors.green} />
          <Text style={styles.promoText}>Add promo code</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
        </View>

        {/* Balance hint */}
        <View style={styles.balanceHint}>
          <Ionicons name="wallet-outline" size={14} color={colors.textGray} />
          <Text style={styles.balanceHintText}>GrabPay: {money(state.balance)}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>
            Confirm {rideServices.find((s) => s.id === selectedId)?.typeName ?? "Ride"} •{" "}
            {money(rideServices.find((s) => s.id === selectedId)?.baseFare ?? 0)}
          </Text>
        </Pressable>
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
  content: { paddingBottom: 20 },
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#3A7C6A",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mapText: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8 },
  pickupMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  routeCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  routeDotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  routeDotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444" },
  routeDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8, marginLeft: 22 },
  routeInputContainer: { flex: 1 },
  routeInputLabel: { fontSize: 10, color: colors.textLight, fontWeight: "600" },
  routeInputValue: { fontSize: 14, fontWeight: "600", color: colors.textDark },
  routeTextInput: { fontSize: 14, fontWeight: "600", color: colors.textDark, paddingVertical: 2 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 10 },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceCardSelected: { borderColor: colors.green, backgroundColor: colors.greenLight },
  serviceIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconBgSelected: { backgroundColor: colors.green },
  serviceInfo: { flex: 1 },
  serviceNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceName: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  seatBadge: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#F1F5F9", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  seatCount: { fontSize: 10, color: colors.textGray },
  serviceDesc: { fontSize: 12, color: colors.textGray, marginTop: 1 },
  serviceDuration: { fontSize: 11, color: colors.green, fontWeight: "600", marginTop: 2 },
  serviceFareRight: { alignItems: "flex-end", gap: 4 },
  serviceFare: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  selectedCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  promoText: { flex: 1, fontSize: 14, color: colors.textDark, fontWeight: "600" },
  balanceHint: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, gap: 6 },
  balanceHintText: { fontSize: 12, color: colors.textGray },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: 16,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmBtn: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
