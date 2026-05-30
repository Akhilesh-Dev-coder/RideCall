import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CyberTheme } from '../constants/theme';
import { StatusPill } from '../components/StatusPill';
import { CyberButton } from '../components/CyberButton';
import { useAppStore } from '../store/useAppStore';

export const HomeScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  
  // Zustand States
  const helmetModeActive = useAppStore((state) => state.helmetModeActive);
  const setHelmetModeActive = useAppStore((state) => state.setHelmetModeActive);
  const twsConnected = useAppStore((state) => state.twsConnected);
  const twsDeviceName = useAppStore((state) => state.twsDeviceName);
  const defaultDialerActive = useAppStore((state) => state.defaultDialerActive);
  const checkDialerStatus = useAppStore((state) => state.checkDialerStatus);
  const checkTwsStatus = useAppStore((state) => state.checkTwsStatus);
  const recentCalls = useAppStore((state) => state.recentCalls);
  const triggerMockCall = useAppStore((state) => state.triggerMockCall);

  // Tachometer ring dynamic pulsing animation
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Run diagnostics
    checkDialerStatus();
    checkTwsStatus();

    if (helmetModeActive) {
      ringScale.value = withRepeat(withTiming(1.3, { duration: 1800 }), -1, true);
      ringOpacity.value = withRepeat(withTiming(0.1, { duration: 1800 }), -1, true);
    } else {
      ringScale.value = 1;
      ringOpacity.value = 0.4;
    }
  }, [helmetModeActive]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handleToggleHelmetMode = async () => {
    await setHelmetModeActive(!helmetModeActive);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Superbike Cockpit Status Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('permissions')}>
          <Text style={styles.navBtnText}>🚨 DIAGNOSE</Text>
        </TouchableOpacity>
        <Text style={styles.hudLogo}>RIDECALL <Text style={{ color: CyberTheme.cyan }}>AI</Text></Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('settings')}>
          <Text style={styles.navBtnText}>⚙️ SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Center Tachometer Pulser Toggle */}
        <View style={styles.tachometerContainer}>
          {helmetModeActive && (
            <Animated.View 
              style={[
                styles.pulsingRing, 
                { borderColor: CyberTheme.cyan },
                animatedRingStyle
              ]} 
            />
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleHelmetMode}
            style={[
              styles.centerCore,
              helmetModeActive 
                ? { borderColor: CyberTheme.cyan, ...CyberTheme.glowCyan } 
                : { borderColor: CyberTheme.border }
            ]}
          >
            <Text style={[
              styles.coreLabel, 
              { color: helmetModeActive ? CyberTheme.cyan : CyberTheme.textSecondary }
            ]}>
              {helmetModeActive ? 'HELMET MODE' : 'RIDE MODE'}
            </Text>
            <Text style={[
              styles.coreStatus,
              { color: helmetModeActive ? CyberTheme.green : '#4F5D75' }
            ]}>
              {helmetModeActive ? 'ACTIVE' : 'STANDBY'}
            </Text>
            <Text style={styles.coreTach}>
              {helmetModeActive ? '🎙️ LISTENING' : 'OFFLINE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Grid Diagnostics */}
        <View style={styles.panelContainer}>
          <Text style={styles.panelTitle}>TELEMETRY STREAM</Text>
          <View style={styles.panel}>
            <StatusPill
              label="Earphone Bluetooth Status"
              value={twsConnected ? (twsDeviceName || 'Connected') : 'No Headset'}
              status={twsConnected ? 'active' : 'warning'}
            />
            <StatusPill
              label="System Dialer Binding"
              value={defaultDialerActive ? 'Ready' : 'Incomplete'}
              status={defaultDialerActive ? 'active' : 'error'}
            />
            <StatusPill
              label="Background Execution"
              value={helmetModeActive ? 'Running' : 'Standby'}
              status={helmetModeActive ? 'active' : 'inactive'}
            />
          </View>
        </View>

        {/* Dev Mock Call Simulator Card */}
        <View style={styles.simulatorCard}>
          <Text style={styles.simulatorTitle}>INTELLIGENT VOICE TESTER</Text>
          <Text style={styles.simulatorDesc}>
            Verify your Bluetooth headset microphone. Tapping below simulates a real hands-free call sequence.
          </Text>
          <CyberButton
            title="Simulate Voice Flow"
            type="primary"
            onPress={triggerMockCall}
          />
        </View>

        {/* Hands-Free Log Activity */}
        <View style={styles.logContainer}>
          <Text style={styles.panelTitle}>HANDS-FREE CALL LOGGER</Text>
          {recentCalls.length === 0 ? (
            <View style={styles.emptyLog}>
              <Text style={styles.emptyLogText}>NO INCOMING CALLS INTERCEPTED YET</Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {recentCalls.map((call) => (
                <View key={call.id} style={styles.logItem}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logCaller}>{call.callerName}</Text>
                    <Text style={styles.logNumber}>{call.callerNumber}</Text>
                  </View>
                  <View style={styles.logResultContainer}>
                    <View style={[
                      styles.logResultPill,
                      { borderColor: call.action === 'answered' ? CyberTheme.green : CyberTheme.red }
                    ]}>
                      <Text style={[
                        styles.logResultText,
                        { color: call.action === 'answered' ? CyberTheme.green : CyberTheme.red }
                      ]}>
                        {call.action.toUpperCase()} BY VOICE
                      </Text>
                    </View>
                    <Text style={styles.logTime}>{call.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CyberTheme.bg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: CyberTheme.border,
    backgroundColor: '#070911',
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1D243A',
    backgroundColor: '#0F121F',
  },
  navBtnText: {
    color: CyberTheme.cyan,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hudLogo: {
    color: CyberTheme.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  tachometerContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  pulsingRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  centerCore: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    backgroundColor: '#0B0D17',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CyberTheme.cyan,
  },
  coreLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  coreStatus: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    marginVertical: 4,
  },
  coreTach: {
    color: '#4F5D75',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  panelContainer: {
    marginVertical: 12,
  },
  panelTitle: {
    color: '#4F5D75', // Tactically muted panel labels
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
    paddingLeft: 4,
  },
  panel: {
    backgroundColor: '#0A0C16',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
  },
  simulatorCard: {
    backgroundColor: '#0F121C',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
    padding: 16,
    marginVertical: 12,
  },
  simulatorTitle: {
    color: CyberTheme.cyan,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  simulatorDesc: {
    color: CyberTheme.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  logContainer: {
    marginVertical: 12,
  },
  emptyLog: {
    paddingVertical: 30,
    backgroundColor: '#070911',
    borderWidth: 1,
    borderColor: '#151928',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogText: {
    color: '#2F3850',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  logList: {
    backgroundColor: '#0A0C16',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#171B26',
  },
  logInfo: {
    flex: 1,
  },
  logCaller: {
    color: CyberTheme.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  logNumber: {
    color: CyberTheme.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  logResultContainer: {
    alignItems: 'flex-end',
  },
  logResultPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#070911',
  },
  logResultText: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logTime: {
    color: '#4F5D75',
    fontSize: 8,
    marginTop: 4,
    fontWeight: 'bold',
  },
});
