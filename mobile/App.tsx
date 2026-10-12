import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useAppStore } from "./src/state/store";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { StartEarningScreen } from "./src/screens/StartEarningScreen";
import { PositionScreen } from "./src/screens/PositionScreen";
import { SpotScreen } from "./src/screens/SpotScreen";
import { ActivityScreen } from "./src/screens/ActivityScreen";
import { BottomTabBar } from "./src/components/BottomTabBar";
import { UnwindModal } from "./src/components/UnwindModal";
import { colors } from "./src/theme";

export default function App() {
  const { isAuthenticated, isRiskGuardModalOpen, activeTab } = useAppStore();

  if (!isAuthenticated) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <WelcomeScreen />
      </View>
    );
  }

  const renderActiveScreen = () => {
    if (isRiskGuardModalOpen) {
      return <PositionScreen />;
    }
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "earn":
        return <StartEarningScreen />;
      case "spot":
        return <SpotScreen />;
      case "activity":
        return <ActivityScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {renderActiveScreen()}
      {!isRiskGuardModalOpen && <BottomTabBar />}
      <UnwindModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
