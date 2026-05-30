import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CyberTheme } from '../constants/theme';
import { CyberButton } from '../components/CyberButton';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  
  // Radar visual pulsing animation
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(0.6);

  useEffect(() => {
    scaleValue.value = withRepeat(withTiming(1.8, { duration: 1500 }), -1, false);
    opacityValue.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic matrix grid pattern lines in the background */}
      <View style={styles.gridOverlay} />
      
      <View style={styles.content}>
        {/* Header HUD section */}
        <View style={styles.header}>
          <Text style={styles.tagline}>AUTOMOTIVE VOICE HUD</Text>
          <Text style={styles.title}>RIDECALL <Text style={{ color: CyberTheme.cyan }}>AI</Text></Text>
          <View style={styles.glowLine} />
        </View>

        {/* Hero Pulser Radar graphic representing helmet wireless connection */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.pulseCircle, pulseStyle]} />
          <View style={styles.centerNode}>
            <Text style={styles.nodeText}>🎙️</Text>
          </View>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>HANDS-FREE CONTROL</Text>
              <Text style={styles.featureDesc}>Answer or reject system cell calls completely by voice. No screen touching.</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>SAFETY-FIRST HUD</Text>
              <Text style={styles.featureDesc}>Never take your eyes off the road. Designed specifically for riders/drivers.</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎧</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>TWS EARBUD READY</Text>
              <Text style={styles.featureDesc}>Audio routes perfectly to Bluetooth AirPods, Cardo, or helmet headsets.</Text>
            </View>
          </View>
        </View>

        {/* CTA Onboarding Trigger */}
        <View style={styles.footer}>
          <CyberButton
            title="Get Started"
            type="primary"
            onPress={completeOnboarding}
          />
          <Text style={styles.footerNotes}>RideCall AI does not collect or upload voice data. All processing is completely offline.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CyberTheme.bg,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.05,
    borderWidth: 1,
    borderColor: CyberTheme.cyan,
    // Emulates a superbike display background
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  tagline: {
    color: CyberTheme.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  title: {
    color: CyberTheme.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6,
  },
  glowLine: {
    height: 2,
    width: 80,
    backgroundColor: CyberTheme.cyan,
    marginTop: 10,
    shadowColor: CyberTheme.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  heroContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: CyberTheme.cyan,
    backgroundColor: 'transparent',
  },
  centerNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#121727',
    borderWidth: 1.5,
    borderColor: CyberTheme.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CyberTheme.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeText: {
    fontSize: 24,
  },
  featuresContainer: {
    marginVertical: 10,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#0F121C', // Dark space
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
    padding: 14,
    marginVertical: 6,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 22,
    color: CyberTheme.cyan,
    marginRight: 14,
    textAlign: 'center',
    width: 30,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: CyberTheme.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  featureDesc: {
    color: CyberTheme.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerNotes: {
    color: '#4F5D75',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
});
