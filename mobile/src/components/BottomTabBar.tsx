import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppStore } from "../state/store";

interface TabItem {
  key: "home" | "earn" | "spot" | "activity";
  label: string;
  iconSymbol: string;
}

const TABS: TabItem[] = [
  { key: "home", label: "Home", iconSymbol: "⌂" },
  { key: "earn", label: "Earn", iconSymbol: "⚡" },
  { key: "spot", label: "Spot CLOB", iconSymbol: "⇄" },
  { key: "activity", label: "Activity", iconSymbol: "☰" },
];

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.navPill}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <Text
                style={[
                  styles.tabIcon,
                  isActive ? styles.activeIcon : styles.inactiveIcon,
                ]}
              >
                {tab.iconSymbol}
              </Text>
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
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  navPill: {
    flexDirection: "row",
    backgroundColor: "rgba(18, 22, 32, 0.92)",
    borderWidth: 1,
    borderColor: "#1E2638",
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 24,
  },
  activeTabButton: {
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.3)",
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  activeIcon: {
    color: "#CCFF00",
  },
  inactiveIcon: {
    color: "#94A3B8",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  activeLabel: {
    color: "#CCFF00",
  },
  inactiveLabel: {
    color: "#94A3B8",
  },
});
