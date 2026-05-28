import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius } from "../constants/theme";
import { money } from "../src/domain/format";
import { useGrab } from "../src/state/GrabProvider";
import type { ActiveOrder } from "../src/domain/types";

const STEPS_RIDE = ["Finding", "Assigned", "Arriving", "On Trip", "Arrived"];
const STEPS_FOOD = ["Placed", "Confirmed", "Preparing", "Picked Up", "Delivered"];

// ── Pulsing dot component ─────────────────────────────────────────────────────
function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.8, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.9, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={pulseStyles.wrap}>
      <Animated.View style={[pulseStyles.ring, { transform: [{ scale }], opacity }]} />
      <View style={pulseStyles.dot} />
    </View>
  );
}

const pulseStyles = StyleSheet.create({
  wrap: { width: 18, height: 18, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 18, height: 18, borderRadius: 9, backgroundColor: colors.green, opacity: 0.4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
});

// ── Animated progress bar ─────────────────────────────────────────────────────
function AnimatedProgressBar({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={progressStyles.track}>
      <Animated.View style={[progressStyles.fill, { width }]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: "#E8F5E9", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.green, borderRadius: 3 },
});

// ── Animated map driver dot ───────────────────────────────────────────────────
function MapView({ order, isActive }: { order: ActiveOrder; isActive: boolean }) {
  const driverX = useRef(new Animated.Value(0.3)).current;
  const driverY = useRef(new Animated.Value(0.6)).current;
  const carAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;
    // Simulate driver moving towards destination
    Animated.loop(
      Animated.sequence([
        Animated.timing(driverX, { toValue: 0.3 + order.progress * 0.4, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(driverY, { toValue: 0.6 - order.progress * 0.25, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(driverX, { toValue: 0.3 + order.progress * 0.4 + 0.02, duration: 2000, useNativeDriver: false }),
        Animated.timing(driverY, { toValue: 0.6 - order.progress * 0.25 - 0.01, duration: 2000, useNativeDriver: false }),
      ])
    ).start();

    // Pulsing car icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(carAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [order.progress, isActive]);

  const carScale = carAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });

  return (
    <View style={mapStyles.map}>
      {/* Fake road grid */}
      {[0.2, 0.45, 0.7].map((y) => (
        <View key={y} style={[mapStyles.roadH, { top: `${y * 100}%` as any }]} />
      ))}
      {[0.25, 0.55, 0.8].map((x) => (
        <View key={x} style={[mapStyles.roadV, { left: `${x * 100}%` as any }]} />
      ))}

      {/* Destination pin */}
      <View style={[mapStyles.destPin, { left: "72%", top: "22%" }]}>
        <View style={mapStyles.destDot} />
        <View style={mapStyles.destStem} />
      </View>

      {/* Driver icon */}
      <Animated.View
        style={[
          mapStyles.driverPin,
          {
            left: driverX.interpolate({ inputRange: [0, 1], outputRange: ["5%", "75%"] }),
            top: driverY.interpolate({ inputRange: [0, 1], outputRange: ["20%", "75%"] }),
            transform: [{ scale: carScale }],
          },
        ]}
      >
        <View style={mapStyles.driverBg}>
          <Ionicons
            name={order.type === "RIDE" ? "car" : "bicycle"}
            size={16}
            color="#fff"
          />
        </View>
        <View style={mapStyles.driverStem} />
      </Animated.View>

      {/* ETA bubble */}
      <View style={mapStyles.etaBubble}>
        <Text style={mapStyles.etaValue}>{order.estimateMinutes}</Text>
        <Text style={mapStyles.etaUnit}>min</Text>
      </View>

      {/* Live badge */}
      {isActive && (
        <View style={mapStyles.liveBadge}>
          <View style={mapStyles.liveDot} />
          <Text style={mapStyles.liveText}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const mapStyles = StyleSheet.create({
  map: { height: 230, backgroundColor: "#E8F0E8", position: "relative", overflow: "hidden" },
  roadH: { position: "absolute", left: 0, right: 0, height: 8, backgroundColor: "#D0DDD0" },
  roadV: { position: "absolute", top: 0, bottom: 0, width: 8, backgroundColor: "#D0DDD0" },
  destPin: { position: "absolute", alignItems: "center" },
  destDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#EF4444", borderWidth: 2, borderColor: "#fff", zIndex: 2 },
  destStem: { width: 2, height: 8, backgroundColor: "#EF4444" },
  driverPin: { position: "absolute", alignItems: "center", zIndex: 10 },
  driverBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  driverStem: { width: 2, height: 6, backgroundColor: colors.green },
  etaBubble: { position: "absolute", top: 14, right: 14, backgroundColor: "rgba(15,23,42,0.82)", borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  etaValue: { fontSize: 22, fontWeight: "900", color: "#fff", lineHeight: 24 },
  etaUnit: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  liveBadge: { position: "absolute", top: 14, left: 14, backgroundColor: "#EF4444", borderRadius: 20, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
});

// ── Step timeline ─────────────────────────────────────────────────────────────
function StepTimeline({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <View style={timelineStyles.row}>
      {steps.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <View key={step} style={timelineStyles.item}>
            <View style={timelineStyles.dotRow}>
              {i > 0 && <View style={[timelineStyles.line, done && timelineStyles.lineDone]} />}
              <View style={[timelineStyles.dot, done && timelineStyles.dotDone, isCurrent && timelineStyles.dotCurrent]}>
                {isCurrent ? (
                  <View style={timelineStyles.dotInner} />
                ) : done ? (
                  <Ionicons name="checkmark" size={8} color="#fff" />
                ) : null}
              </View>
              {i < steps.length - 1 && <View style={[timelineStyles.line, done && i < currentIndex && timelineStyles.lineDone]} />}
            </View>
            <Text style={[timelineStyles.label, done && timelineStyles.labelDone, isCurrent && timelineStyles.labelCurrent]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  item: { flex: 1, alignItems: "center", gap: 5 },
  dotRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", zIndex: 1 },
  dotDone: { backgroundColor: colors.green },
  dotCurrent: { backgroundColor: colors.green, borderWidth: 2, borderColor: colors.greenLight },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  line: { flex: 1, height: 2, backgroundColor: "#E2E8F0" },
  lineDone: { backgroundColor: colors.green },
  label: { fontSize: 9, color: colors.textLight, textAlign: "center" },
  labelDone: { color: colors.textGray },
  labelCurrent: { color: colors.green, fontWeight: "700" },
});

// ── Driver / Rider card ───────────────────────────────────────────────────────
function DriverCard({ order, onCall, onChat }: { order: ActiveOrder; onCall: () => void; onChat: () => void }) {
  if (!order.driverName) return null;
  const isRide = order.type === "RIDE";

  return (
    <View style={driverStyles.card}>
      <View style={driverStyles.avatarWrap}>
        <View style={driverStyles.avatar}>
          <Ionicons name={isRide ? "person" : "bicycle"} size={20} color="#fff" />
        </View>
        <View style={driverStyles.ratingBadge}>
          <Ionicons name="star" size={8} color={colors.gold} />
          <Text style={driverStyles.ratingText}>4.9</Text>
        </View>
      </View>

      <View style={driverStyles.info}>
        <Text style={driverStyles.name}>{order.driverName}</Text>
        <Text style={driverStyles.role}>{isRide ? "Your GrabCar driver" : "Your GrabFood rider"}</Text>
        {order.vehiclePlate ? (
          <View style={driverStyles.plateBadge}>
            <Text style={driverStyles.plateText}>{order.vehiclePlate}</Text>
          </View>
        ) : null}
      </View>

      <View style={driverStyles.actions}>
        <Pressable style={driverStyles.actionBtn} onPress={onCall}>
          <Ionicons name="call" size={16} color={colors.green} />
        </Pressable>
        <Pressable style={driverStyles.actionBtn} onPress={onChat}>
          <Ionicons name="chatbubble-ellipses" size={16} color={colors.green} />
        </Pressable>
      </View>
    </View>
  );
}

const driverStyles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, padding: 14, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatarWrap: { position: "relative" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  ratingBadge: { position: "absolute", bottom: -2, right: -4, backgroundColor: "#fff", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 2, gap: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  ratingText: { fontSize: 9, fontWeight: "700", color: colors.textDark },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  role: { fontSize: 11, color: colors.textGray, marginTop: 1 },
  plateBadge: { marginTop: 4, backgroundColor: "#F1F5F9", borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, alignSelf: "flex-start" },
  plateText: { fontSize: 11, fontWeight: "700", color: colors.textDark, letterSpacing: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: colors.greenLight, backgroundColor: colors.greenLight, alignItems: "center", justifyContent: "center" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OrderTrackingScreen() {
  const { state, store } = useGrab();
  const router = useRouter();

  const order = state.activeOrders[0] ?? state.pastOrders[0];

  if (!order) {
    return (
      <View style={styles.emptyScreen}>
        <Ionicons name="receipt-outline" size={60} color={colors.textLight} />
        <Text style={styles.emptyTitle}>No active order</Text>
        <Pressable style={styles.homeBtn} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  const isActive = state.activeOrders.some((o) => o.id === order.id);
  const steps = order.type === "RIDE" ? STEPS_RIDE : STEPS_FOOD;
  const currentStep = Math.round(order.progress * (steps.length - 1));

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {order.type === "RIDE" ? "Track Ride" : "Track Order"}
        </Text>
        <Pressable
          style={styles.helpBtn}
          onPress={() => store.showAnnouncement("Help & Support is not available in this demo.")}
        >
          <Ionicons name="help-circle-outline" size={22} color={colors.textDark} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Map */}
        <MapView order={order} isActive={isActive} />

        {/* Status card — overlaps map */}
        <View style={styles.statusCard}>
          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.statusIconBg, isActive && styles.statusIconBgActive]}>
              <Ionicons
                name={order.type === "RIDE" ? "car" : "restaurant"}
                size={22}
                color={isActive ? colors.green : colors.textGray}
              />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>{order.statusText}</Text>
              <Text style={styles.statusSub}>{order.subtitle}</Text>
            </View>
            {isActive && <PulseDot />}
          </View>

          {/* Animated progress */}
          <AnimatedProgressBar progress={order.progress} />

          {/* Timeline steps */}
          <View style={{ marginTop: 14 }}>
            <StepTimeline steps={steps} currentIndex={currentStep} />
          </View>
        </View>

        {/* Driver card */}
        <DriverCard
          order={order}
          onCall={() => store.showAnnouncement("Calling is not available in this demo.")}
          onChat={() => store.showAnnouncement("In-app chat is not available in this demo.")}
        />

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {order.type === "RIDE" ? "Destination" : "Restaurant"}
            </Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{order.title}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValueBold}>{money(order.cost)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <View style={styles.payBadge}>
              <Ionicons name="card" size={12} color={colors.green} />
              <Text style={styles.payBadgeText}>GrabPay</Text>
            </View>
          </View>
        </View>

        {/* Cancel / Done */}
        {isActive ? (
          <Pressable
            style={styles.cancelBtn}
            onPress={() => store.showAnnouncement("Order cancellation is not available after confirmation in this demo.")}
          >
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.doneBtn}
            onPress={() => {
              store.clearTrackingOrder();
              router.push("/(tabs)/activity");
            }}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.doneBtnText}>Done — View Activity</Text>
          </Pressable>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  emptyScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: colors.background },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  homeBtn: { backgroundColor: colors.green, borderRadius: radius.lg, paddingHorizontal: 28, paddingVertical: 12 },
  homeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
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
  helpBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.textDark },
  content: { paddingBottom: 20 },
  statusCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  statusIconBg: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  statusIconBgActive: { backgroundColor: colors.greenLight },
  statusText: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: "800", color: colors.textDark },
  statusSub: { fontSize: 12, color: colors.textGray, marginTop: 2 },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.md,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeading: { fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  summaryLabel: { fontSize: 13, color: colors.textGray },
  summaryValue: { fontSize: 13, color: colors.textDark, maxWidth: "55%", textAlign: "right" },
  summaryValueBold: { fontSize: 15, fontWeight: "800", color: colors.textDark },
  divider: { height: 1, backgroundColor: "#F2F4F7" },
  payBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.greenLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  payBadgeText: { fontSize: 12, fontWeight: "700", color: colors.green },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    backgroundColor: "#FFF5F5",
  },
  cancelBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.lg,
    paddingVertical: 14,
    backgroundColor: colors.green,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
