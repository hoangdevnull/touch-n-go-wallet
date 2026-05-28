import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, radius } from "../constants/theme";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function GreenButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[styles.greenButton, disabled && styles.greenButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.greenButtonText}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.outlineButton} onPress={onPress}>
      <Text style={styles.outlineButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
  },
  sectionAction: {
    fontSize: 13,
    color: colors.green,
    fontWeight: "600",
  },
  greenButton: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
  },
  greenButtonDisabled: {
    opacity: 0.5,
  },
  greenButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: 11,
    alignItems: "center",
  },
  outlineButtonText: {
    color: colors.green,
    fontWeight: "700",
    fontSize: 15,
  },
});
