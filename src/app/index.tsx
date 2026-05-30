import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '@/store/useAppStore';
import { useNativeEvents } from '@/hooks/useNativeEvents';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { PermissionsScreen } from '@/screens/PermissionsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { IncomingCallScreen } from '@/screens/IncomingCallScreen';
import { CyberTheme } from '@/constants/theme';

export default function IndexEntrypoint() {
  // Start native background event listener
  useNativeEvents();

  const currentScreen = useAppStore((state) => state.currentScreen);

  // Render correct screen dynamically based on state router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'permissions':
        return <PermissionsScreen />;
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'incoming_call':
        return <IncomingCallScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CyberTheme.bg,
  },
});
