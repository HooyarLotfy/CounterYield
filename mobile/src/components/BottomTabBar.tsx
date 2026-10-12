import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useAppStore } from "../state/store";
import { colors, radius } from "../theme";
import {
  Home,
  Zap,
  ArrowLeftRight,
  Clock,
} from "lucide-react-native";

interface TabItem {
  key: "home" | "earn" | "spot" | "activity";
  label: string;
  IconComponent: any;
}

const TABS: TabItem[] = [
  { key: "home", label: "Home", IconComponent: Home },
  { key: "earn", label: "Earn", IconComponent: Zap },
  { key: "spot", label: "CLOB", IconComponent: ArrowLeftRight },
  { key: "activity", label: "Activity", IconComponent: Clock },
];

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.dock}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const { IconComponent } = tab;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={20}
                  color={isActive ? colors.lime : colors.textSecondary}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {isActive && <View style={styles.activeDot} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 28 : 20,
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 100,
  },
  dock: {
    flexDirection: "row",
    backgroundColor: colors.glassDock,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 380,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
  },
  activeTabButton: {
    backgroundColor: colors.limeMuted,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.lime,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 0.1,
  },
  activeLabel: {
    color: colors.lime,
    fontWeight: "700",
  },
  inactiveLabel: {
    color: colors.textSecondary,
  },
});
