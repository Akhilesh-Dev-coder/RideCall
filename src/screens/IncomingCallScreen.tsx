import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CyberTheme } from '../constants/theme';
import { CallWaveform } from '../components/CallWaveform';
import { CyberButton } from '../components/CyberButton';
import { useAppStore } from '../store/useAppStore';

export const IncomingCallScreen: React.FC = () => {
  const callerName = useAppStore((state) => state.callerName);
  const callerNumber = useAppStore((state) => state.callerNumber);
  const assistantState = useAppStore((state) => state.assistantState);
  const rmsValue = useAppStore((state) => state.rmsValue);
  
  const manualAnswer = useAppStore((state) => state.manualAnswer);
  const manualReject = useAppStore((state) => state.manualReject);

  // Animate phone icon vibrating
  const iconOffset = useSharedValue(0);

  useEffect(() => {
    if (assistantState === 'listening' || assistantState === 'announcing') {
      iconOffset.value = withRepeat(withTiming(8, { duration: 100 }), -1, true);
    } else {
      iconOffset.value = 0;
    }
  }, [assistantState]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: iconOffset.value },
      { rotate: `${iconOffset.value / 2}deg` }
    ],
  }));

  // Define assistant state prompt texts and colors
  let statusText = 'INCOMING TELEPHONY BIND';
  let statusColor: string = CyberTheme.yellow;
  let statusDesc = 'Initializing hands-free assistant...';

  if (assistantState === 'announcing') {
    statusText = 'TTS ANNOUNCEMENT';
    statusColor = CyberTheme.yellow;
    statusDesc = 'Speaking caller ID to Bluetooth headset...';
  } else if (assistantState === 'listening') {
    statusText = '🎙️ LISTENING ACTIVE';
    statusColor = CyberTheme.cyan;
    statusDesc = 'SAY "ACCEPT" / "ANSWER" OR "DECLINE" / "REJECT"';
  } else if (assistantState === 'answering') {
    statusText = 'CONNECTING CELL LINE';
    statusColor = CyberTheme.green;
    statusDesc = 'Hands-free voice acceptance executed...';
  } else if (assistantState === 'rejecting') {
    statusText = 'TERMINATING CELL LINE';
    statusColor = CyberTheme.red;
    statusDesc = 'Hands-free voice rejection executed...';
  } else if (assistantState === 'timeout') {
    statusText = 'RECOGNITION TIMEOUT';
    statusColor = CyberTheme.textSecondary;
    statusDesc = 'Letting phone ring normally...';
  } else if (assistantState === 'error') {
    statusText = 'MIC BIND ERROR';
    statusColor = CyberTheme.red;
    statusDesc = 'Mic occupied. Use manual overrides below.';
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Superbike Tach Grid overlay */}
      <View style={styles.gridOverlay} />

      <View style={styles.content}>
        {/* State Telemetry HUD */}
        <View style={styles.telemetryBar}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.telemetryText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Pulsing incoming call graphic */}
        <View style={styles.callerCard}>
          <Animated.View style={[styles.avatarFrame, animatedIconStyle, { borderColor: statusColor }]}>
            <Text style={styles.avatarText}>📞</Text>
          </Animated.View>
          
          <Text style={styles.callerName}>{callerName.toUpperCase()}</Text>
          <Text style={styles.callerNumber}>{callerNumber}</Text>
        </View>

        {/* Live Audio Equalizer Waveform */}
        <View style={styles.waveformContainer}>
          <CallWaveform
            rmsValue={rmsValue}
            isListening={assistantState === 'listening'}
            color={statusColor}
          />
          <Text style={[styles.instructions, { color: statusColor }]}>
            {statusDesc}
          </Text>
        </View>

        {/* Emergency Manual Tactical Overrides */}
        <View style={styles.overridePanel}>
          <Text style={styles.overrideLabel}>EMERGENCY TACTILE OVERRIDES</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CyberButton
                title="Decline"
                type="danger"
                onPress={manualReject}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CyberButton
                title="Answer"
                type="success"
                onPress={manualAnswer}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070D', // Extra deep slate black
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    borderWidth: 1,
    borderColor: CyberTheme.cyan,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E111A',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  telemetryText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  callerCard: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F121C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 36,
  },
  callerName: {
    color: CyberTheme.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  callerNumber: {
    color: CyberTheme.textSecondary,
    fontSize: 14,
    marginTop: 6,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  waveformContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  instructions: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 10,
  },
  overridePanel: {
    marginBottom: 10,
  },
  overrideLabel: {
    color: '#3F4D65', // Muted override label
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
});
