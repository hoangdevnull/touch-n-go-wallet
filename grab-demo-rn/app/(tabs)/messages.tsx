import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../constants/theme";
import { useGrab } from "../../src/state/GrabProvider";

const MESSAGES = [
  { id: "1", from: "GrabPay", preview: "Your wallet has been successfully credited S$30.00.", time: "10:45 AM", unread: true, icon: "wallet-outline" },
  { id: "2", from: "Promotions", preview: "Flash deal! 20% off JustGrab rides today only. Use code GRABGO.", time: "Yesterday", unread: true, icon: "megaphone-outline" },
  { id: "3", from: "Driver John Doe", preview: "I have arrived at your pickup location. Please come out.", time: "25 May", unread: false, icon: "car-outline" },
  { id: "4", from: "GrabFood", preview: "Your order from McBurger Supreme has been delivered. Rate your experience!", time: "24 May", unread: false, icon: "restaurant-outline" },
  { id: "5", from: "GrabRewards", preview: "You've earned 228 Reward Points from your recent orders. Keep it up!", time: "23 May", unread: false, icon: "gift-outline" },
  { id: "6", from: "Account Security", preview: "A new login was detected from your account on iPhone 15 Pro.", time: "22 May", unread: false, icon: "shield-checkmark-outline" },
];

export default function MessagesScreen() {
  const { store } = useGrab();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable onPress={() => store.showAnnouncement("All messages marked as read.")}>
          <Text style={styles.markRead}>Mark all read</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {MESSAGES.map((msg, i) => (
          <Pressable
            key={msg.id}
            style={[styles.msgRow, i < MESSAGES.length - 1 && styles.msgRowBorder]}
            onPress={() => store.showAnnouncement(`Opening message from ${msg.from}:\n\n"${msg.preview}"`)}
          >
            <View style={[styles.msgIcon, msg.unread && styles.msgIconUnread]}>
              <Ionicons name={msg.icon as any} size={20} color={msg.unread ? colors.green : colors.textGray} />
            </View>
            <View style={styles.msgBody}>
              <View style={styles.msgTopRow}>
                <Text style={[styles.msgFrom, msg.unread && styles.msgFromBold]}>{msg.from}</Text>
                <Text style={styles.msgTime}>{msg.time}</Text>
              </View>
              <Text style={[styles.msgPreview, msg.unread && styles.msgPreviewBold]} numberOfLines={1}>
                {msg.preview}
              </Text>
            </View>
            {msg.unread && <View style={styles.unreadDot} />}
          </Pressable>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.textDark },
  markRead: { fontSize: 13, color: colors.green, fontWeight: "600" },
  list: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  msgRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  msgRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F2F4F7" },
  msgIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  msgIconUnread: { backgroundColor: colors.greenLight },
  msgBody: { flex: 1 },
  msgTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  msgFrom: { fontSize: 14, color: colors.textDark, fontWeight: "500" },
  msgFromBold: { fontWeight: "700" },
  msgTime: { fontSize: 11, color: colors.textLight },
  msgPreview: { fontSize: 12, color: colors.textGray },
  msgPreviewBold: { color: colors.textDark },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
});
