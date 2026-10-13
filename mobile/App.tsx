import React from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { useAppStore } from "./src/state/store";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { StartEarningScreen } from "./src/screens/StartEarningScreen";
import { PositionScreen } from "./src/screens/PositionScreen";
import { PortfolioScreen } from "./src/screens/PortfolioScreen";
import { ActivityScreen } from "./src/screens/ActivityScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { BottomTabBar } from "./src/components/BottomTabBar";
import { UnwindModal } from "./src/components/UnwindModal";
import { colors } from "./src/theme";

export default function App() {
  const { isAuthenticated, isRiskGuardModalOpen, activeTab } = useAppStore();

  const renderActiveScreen = () => {
    if (isRiskGuardModalOpen) {
      return <PositionScreen />;
    }
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "earn":
        return <StartEarningScreen />;
      case "portfolio":
      case "spot":
        return <PortfolioScreen />;
      case "activity":
        return <ActivityScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.appContainer}>
        {!isAuthenticated ? (
          <WelcomeScreen />
        ) : (
          <>
            {renderActiveScreen()}
            {!isRiskGuardModalOpen && <BottomTabBar />}
            <UnwindModal />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  appContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    backgroundColor: colors.bg,
    position: "relative",
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }
      : {}),
  },
});
