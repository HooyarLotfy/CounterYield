import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform, ScrollView } from "react-native";
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
          <Text style={{ color: colors.lime, fontSize: 18, fontWeight: "bold", marginBottom: 8, marginTop: 40 }}>
            CounterYield Render Error
          </Text>
          <Text style={{ color: colors.crimson, fontSize: 14, marginBottom: 16 }}>
            {this.state.error?.message || "Unknown rendering exception"}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Platform.OS === "web" ? "monospace" : undefined }}>
            {this.state.error?.stack || ""}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isAuthenticated, isRiskGuardModalOpen, activeTab } = useAppStore();

  return (
    <ErrorBoundary>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <View style={styles.appContainer}>
          {!isAuthenticated ? (
            <WelcomeScreen />
          ) : (
            <>
              {isRiskGuardModalOpen ? (
                <PositionScreen />
              ) : (
                <View style={styles.screensContainer}>
                  <View style={[styles.screenWrapper, activeTab === "home" ? styles.screenVisible : styles.screenHidden]}>
                    <HomeScreen />
                  </View>
                  <View style={[styles.screenWrapper, activeTab === "earn" ? styles.screenVisible : styles.screenHidden]}>
                    <StartEarningScreen />
                  </View>
                  <View style={[styles.screenWrapper, (activeTab === "portfolio" || activeTab === "spot") ? styles.screenVisible : styles.screenHidden]}>
                    <PortfolioScreen />
                  </View>
                  <View style={[styles.screenWrapper, activeTab === "activity" ? styles.screenVisible : styles.screenHidden]}>
                    <ActivityScreen />
                  </View>
                  <View style={[styles.screenWrapper, activeTab === "settings" ? styles.screenVisible : styles.screenHidden]}>
                    <SettingsScreen />
                  </View>
                </View>
              )}
              {!isRiskGuardModalOpen && <BottomTabBar />}
              <UnwindModal />
            </>
          )}
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    backgroundColor: colors.bg,
    alignSelf: "center",
    position: "relative",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }
      : {}),
  },
  screensContainer: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  screenVisible: {
    display: "flex",
  },
  screenHidden: {
    display: "none",
  },
});
