import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Platform } from 'react-native';
import { CyberTheme } from '../constants/theme';
import { CyberButton } from '../components/CyberButton';
import { useAppStore } from '../store/useAppStore';

export const SettingsScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [customSms, setCustomSms] = useState(settings.customSmsMessage);

  const handleTtsSpeedChange = (speed: number) => {
    updateSettings({ ttsSpeed: speed });
  };

  const handleTimeoutChange = (timeout: number) => {
    updateSettings({ responseTimeout: timeout });
  };

  const handleAutoRepeatToggle = (value: boolean) => {
    updateSettings({ autoRepeat: value });
  };

  const handleSmsToggle = (value: boolean) => {
    updateSettings({ smsReplyEnabled: value });
  };

  const handleSaveSmsText = () => {
    updateSettings({ customSmsMessage: customSms });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Superbike Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('home')}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>COCKPIT CONFIG</Text>
        <View style={{ width: 60 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: TTS Announcement Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SPEECH SYNTHESIS ENGINE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>AUTO-REPEAT PROMPT</Text>
              <Switch
                value={settings.autoRepeat}
                onValueChange={handleAutoRepeatToggle}
                trackColor={{ false: '#161B2B', true: 'rgba(102, 252, 241, 0.3)' }}
                thumbColor={settings.autoRepeat ? CyberTheme.cyan : '#4F5D75'}
              />
            </View>
            <Text style={styles.desc}>
              If no command is heard on the first attempt, RideCall AI will repeat the caller announcement once more.
            </Text>

            <View style={styles.divider} />

            <View style={styles.sliderHeader}>
              <Text style={styles.label}>ANNOUNCEMENT SPEED</Text>
              <Text style={styles.value}>{settings.ttsSpeed.toFixed(1)}x</Text>
            </View>
            <View style={styles.speedOptions}>
              {[0.8, 1.0, 1.2, 1.4, 1.6].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.optionBtn,
                    settings.ttsSpeed === speed && { borderColor: CyberTheme.cyan, backgroundColor: '#131A2B' }
                  ]}
                  onPress={() => handleTtsSpeedChange(speed)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.ttsSpeed === speed && { color: CyberTheme.cyan }
                  ]}>
                    {speed.toFixed(1)}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: Recognition Calibration */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>VOICE COMMAND CAPTURE</Text>
          <View style={styles.card}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>LISTENING RESPONSE TIMEOUT</Text>
              <Text style={styles.value}>{(settings.responseTimeout / 1000).toFixed(0)} SEC</Text>
            </View>
            <View style={styles.speedOptions}>
              {[5000, 8000, 10000, 12000, 15000].map((timeout) => (
                <TouchableOpacity
                  key={timeout}
                  style={[
                    styles.optionBtn,
                    settings.responseTimeout === timeout && { borderColor: CyberTheme.cyan, backgroundColor: '#131A2B' }
                  ]}
                  onPress={() => handleTimeoutChange(timeout)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.responseTimeout === timeout && { color: CyberTheme.cyan }
                  ]}>
                    {(timeout / 1000).toFixed(0)}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.desc}>
              The duration the microphone remains active waiting for your voice command before timing out. Set higher for noisy highway riding.
            </Text>
          </View>
        </View>

        {/* Section 3: SMS Responder */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>AUTOMATED SMS RESPONDER</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>SMS REPLY ON REJECT</Text>
              <Switch
                value={settings.smsReplyEnabled}
                onValueChange={handleSmsToggle}
                trackColor={{ false: '#161B2B', true: 'rgba(102, 252, 241, 0.3)' }}
                thumbColor={settings.smsReplyEnabled ? CyberTheme.cyan : '#4F5D75'}
              />
            </View>
            <Text style={styles.desc}>
              Send an automated custom text message to the caller instantly when you decline their call using voice commands.
            </Text>

            {settings.smsReplyEnabled && (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.inputLabel}>SMS REPLY MESSAGE TEMPLATE</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  value={customSms}
                  onChangeText={setCustomSms}
                  placeholder="Enter custom text template"
                  placeholderTextColor="#4F5D75"
                  onBlur={handleSaveSmsText}
                />
                <CyberButton
                  title="Save SMS Template"
                  type="secondary"
                  onPress={handleSaveSmsText}
                  style={styles.saveSmsBtn}
                />
              </View>
            )}
          </View>
        </View>

        {/* Diagnostic Footer */}
        <Text style={styles.debugNotes}>
          SYSTEM VERSION: RideCall AI v1.0.0 (API {Platform.Version})
          {"\n"}ENGINES SYNCED DIRECTLY TO INCALL_SERVICE CACHE
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CyberTheme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: CyberTheme.border,
    backgroundColor: '#070911',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1D243A',
    backgroundColor: '#0F121F',
  },
  backBtnText: {
    color: CyberTheme.cyan,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  title: {
    color: CyberTheme.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    color: '#4F5D75',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#0A0C16',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: CyberTheme.text,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  desc: {
    color: CyberTheme.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#171B26',
    marginVertical: 14,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  value: {
    color: CyberTheme.cyan,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: CyberTheme.border,
    borderRadius: 4,
    paddingVertical: 8,
    marginHorizontal: 3,
    alignItems: 'center',
    backgroundColor: '#0B0D16',
  },
  optionText: {
    color: CyberTheme.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputLabel: {
    color: CyberTheme.cyan,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: CyberTheme.bgInput,
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 4,
    color: CyberTheme.text,
    padding: 10,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  saveSmsBtn: {
    marginVertical: 6,
    paddingVertical: 10,
  },
  debugNotes: {
    color: '#4F5D75',
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 1,
    marginVertical: 20,
    fontWeight: 'bold',
  },
});
