import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CyberTheme } from '../constants/theme';

interface CallWaveformProps {
  rmsValue: number; // decibels, typically -2 to 10
  isListening: boolean;
  color?: string;
}

export const CallWaveform: React.FC<CallWaveformProps> = ({
  rmsValue,
  isListening,
  color = CyberTheme.cyan,
}) => {
  const animatedVolume = useSharedValue(1);

  useEffect(() => {
    if (!isListening) {
      animatedVolume.value = withTiming(1, { duration: 300 });
      return;
    }
    
    // Convert RMS value to scale factor (from 1 to 4.5)
    // rmsValue: -2.0 (silent) -> scale 1.0. rmsValue: 10.0 (loud) -> scale 4.5
    const normalized = Math.max(1.0, Math.min(4.5, 1.0 + (rmsValue + 2) / 3));
    animatedVolume.value = withSpring(normalized, {
      damping: 15,
      stiffness: 120,
    });
  }, [rmsValue, isListening]);

  // Create different multipliers to give a realistic audio-spectrum look
  const barStyles = [
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 0.4 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 0.7 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 1.0 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 1.3 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 1.0 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 0.7 }] })),
    useAnimatedStyle(() => ({ transform: [{ scaleY: animatedVolume.value * 0.4 }] })),
  ];

  return (
    <View style={styles.container}>
      {barStyles.map((animStyle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            { backgroundColor: color },
            isListening && {
              shadowColor: color,
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 4,
            },
            animStyle,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: '100%',
    marginVertical: 20,
  },
  bar: {
    width: 6,
    height: 16,
    borderRadius: 3,
    marginHorizontal: 4,
    opacity: 0.85,
  },
});
