import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../constants/theme";
import { useGrab } from "../../src/state/GrabProvider";

const SAVED_PLACES = [
  { label: "Home", address: "8 Bayfront Ave, Singapore 018956", icon: "home-outline" },
  { label: "Work", address: "1 Raffles Place, #20-61, Singapore 048616", icon: "briefcase-outline" },
];

const SETTINGS = [
  { label: "Payment Methods", icon: "card-outline", group: "Payments" },
  { label: "Transaction History", icon: "receipt-outline", group: "Payments" },
  { label: "Notifications", icon: "notifications-outline", group: "Preferences" },
  { label: "Privacy & Security", icon: "shield-outline", group: "Preferences" },
  { label: "Help & Support", icon: "help-circle-outline", group: "Support" },
  { label: "About Grab", icon: "information-circle-outline", group: "Support" },
];

export default function AccountScreen() {
  const { state, store } = useGrab();

  const settingGroups = Array.from(new Set(SETTINGS.map((s) => s.group)));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profilePhone}>+65 9123 4567</Text>
          </View>
          <Pressable style={styles.editBtn} onPress={() => store.showAnnouncement("Edit profile opens here.")}>
            <Ionicons name="pencil-outline" size={16} color={colors.green} />
          </Pressable>
        </View>

        {/* Points and balance summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.rewardsPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Rewards Pts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>S${state.balance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>GrabPay</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.gold }]}>Silver</Text>
            <Text style={styles.statLabel}>Tier</Text>
          </View>
        </View>
      </View>

      {/* Saved places */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Places</Text>
        <View style={styles.card}>
          {SAVED_PLACES.map((place, i) => (
            <Pressable
              key={place.label}
              style={[styles.placeRow, i > 0 && styles.rowBorder]}
              onPress={() => store.showAnnouncement(`Editing saved place: ${place.label}`)}
            >
              <View style={styles.placeIconBg}>
                <Ionicons name={place.icon as any} size={18} color={colors.green} />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeLabel}>{place.label}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </Pressable>
          ))}
          <Pressable
            style={[styles.placeRow, styles.rowBorder]}
            onPress={() => store.showAnnouncement("Add a new saved place.")}
          >
            <View style={[styles.placeIconBg, styles.placeIconAdd]}>
              <Ionicons name="add" size={18} color={colors.textGray} />
            </View>
            <Text style={[styles.placeLabel, { color: colors.textGray }]}>Add a place</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </Pressable>
        </View>
      </View>

      {/* Settings groups */}
      {settingGroups.map((group) => (
        <View key={group} style={styles.section}>
          <Text style={styles.sectionTitle}>{group}</Text>
          <View style={styles.card}>
            {SETTINGS.filter((s) => s.group === group).map((setting, i, arr) => (
              <Pressable
                key={setting.label}
                style={[styles.settingRow, i > 0 && styles.rowBorder]}
                onPress={() => store.showAnnouncement(`${setting.label} settings open here.`)}
              >
                <View style={styles.settingIconBg}>
                  <Ionicons name={setting.icon as any} size={18} color={colors.textGray} />
                </View>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Sign out */}
      <Pressable
        style={styles.signOutBtn}
        onPress={() => store.showAnnouncement("Sign out is not implemented in this demo.")}
      >
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
  profileCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 20 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: "800", color: colors.textDark },
  profilePhone: { fontSize: 13, color: colors.textGray, marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { fontSize: 16, fontWeight: "800", color: colors.textDark },
  statLabel: { fontSize: 11, color: colors.textGray, marginTop: 2 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark, marginBottom: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  placeRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: "#F2F4F7" },
  placeIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  placeIconAdd: { backgroundColor: "#F1F5F9" },
  placeInfo: { flex: 1 },
  placeLabel: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  placeAddress: { fontSize: 11, color: colors.textGray, marginTop: 1 },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  settingIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.textDark },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF5F5",
    gap: 8,
  },
  signOutText: { fontSize: 15, fontWeight: "700", color: colors.danger },
});
