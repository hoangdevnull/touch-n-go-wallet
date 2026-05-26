import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";

export default function NearMeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.pin}>
        <Ionicons name="location-outline" size={34} color={colors.blue} />
      </View>
      <Text style={styles.title}>Near Me</Text>
      <Text style={styles.body}>Nearby merchants, stations, and offers will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  pin: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    marginBottom: 14,
    width: 60,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
});
