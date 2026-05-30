import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, PermissionsAndroid, Platform, ScrollView } from 'react-native';
import { CyberTheme } from '../constants/theme';
import { CyberButton } from '../components/CyberButton';
import { StatusPill } from '../components/StatusPill';
import { useAppStore } from '../store/useAppStore';

export const PermissionsScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const defaultDialerActive = useAppStore((state) => state.defaultDialerActive);
  const checkDialerStatus = useAppStore((state) => state.checkDialerStatus);
  const requestDialerRole = useAppStore((state) => state.requestDialerRole);

  const [permissionsState, setPermissionsState] = useState({
    microphone: false,
    phoneState: false,
    callAnswer: false,
    contacts: false,
    bluetooth: false,
    notifications: false,
  });

  const checkAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      setPermissionsState({
        microphone: true,
        phoneState: true,
        callAnswer: true,
        contacts: true,
        bluetooth: true,
        notifications: true,
      });
      return;
    }

    const hasMicrophone = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    const hasPhoneState = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
    const hasCallAnswer = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS);
    const hasContacts = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
    
    let hasBluetooth = true;
    if (Platform.Version >= 31) {
      hasBluetooth = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    }

    let hasNotifications = true;
    if (Platform.Version >= 33) {
      hasNotifications = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    setPermissionsState({
      microphone: hasMicrophone,
      phoneState: hasPhoneState,
      callAnswer: hasCallAnswer,
      contacts: hasContacts,
      bluetooth: hasBluetooth,
      notifications: hasNotifications,
    });

    await checkDialerStatus();
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const requestSystemPermissions = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
      ];

      if (Platform.Version >= 31) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }
      if (Platform.Version >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      await PermissionsAndroid.requestMultiple(permissionsToRequest);
      await checkAllPermissions();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRequestDialer = async () => {
    await requestDialerRole();
    await checkAllPermissions();
  };

  const isCoreGranted = 
    permissionsState.microphone && 
    permissionsState.phoneState && 
    permissionsState.callAnswer && 
    defaultDialerActive;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header HUD panel */}
        <View style={styles.header}>
          <Text style={styles.tagline}>DIAGNOSTIC & SECURITY</Text>
          <Text style={styles.title}>PERMISSIONS</Text>
          <Text style={styles.subtitle}>RideCall AI requires specific system roles and permissions to intercept and answer calls completely hands-free.</Text>
          <View style={styles.glowLine} />
        </View>

        {/* Diagnosis Status Checklist */}
        <View style={styles.checklist}>
          <StatusPill
            label="Microphone"
            value={permissionsState.microphone ? "Authorized" : "Required"}
            status={permissionsState.microphone ? "active" : "error"}
          />
          <StatusPill
            label="Phone Call Monitor"
            value={permissionsState.phoneState ? "Authorized" : "Required"}
            status={permissionsState.phoneState ? "active" : "error"}
          />
          <StatusPill
            label="Call Control API"
            value={permissionsState.callAnswer ? "Authorized" : "Required"}
            status={permissionsState.callAnswer ? "active" : "error"}
          />
          <StatusPill
            label="Contacts Lookup"
            value={permissionsState.contacts ? "Authorized" : "Required"}
            status={permissionsState.contacts ? "active" : "warning"}
          />
          <StatusPill
            label="Bluetooth TWS Sync"
            value={permissionsState.bluetooth ? "Authorized" : "Required"}
            status={permissionsState.bluetooth ? "active" : "warning"}
          />
          <StatusPill
            label="System Notifications"
            value={permissionsState.notifications ? "Authorized" : "Required"}
            status={permissionsState.notifications ? "active" : "warning"}
          />
          <StatusPill
            label="Default Dialer Role"
            value={defaultDialerActive ? "Active Dialer" : "Inactive"}
            status={defaultDialerActive ? "active" : "error"}
          />
        </View>

        {/* Dialer Explanation Section */}
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>CRITICAL REQUIREMENT</Text>
            <Text style={styles.alertDesc}>
              Modern Android versions block apps from programmatically answering calls unless they are set as the **Default Phone App** (Dialer). Click below to enable.
            </Text>
          </View>
        </View>

        {/* Action button trigger area */}
        <View style={styles.footer}>
          {!isCoreGranted ? (
            <View style={{ width: '100%' }}>
              <CyberButton
                title="Grant System Permissions"
                type="warning"
                onPress={requestSystemPermissions}
                style={styles.actionBtn}
              />
              <CyberButton
                title="Set As Default Phone App"
                type="primary"
                onPress={handleRequestDialer}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <CyberButton
              title="Enter Cockpit"
              type="success"
              onPress={() => setScreen('home')}
              style={styles.enterBtn}
            />
          )}
          <Text style={styles.diagnosticLog}>SYSTEM CORE DIAGNOSIS: {isCoreGranted ? 'READY' : 'STANDBY'}</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  tagline: {
    color: CyberTheme.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  title: {
    color: CyberTheme.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6,
  },
  subtitle: {
    color: CyberTheme.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
  glowLine: {
    height: 2,
    width: 80,
    backgroundColor: CyberTheme.cyan,
    marginTop: 14,
    shadowColor: CyberTheme.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  checklist: {
    marginVertical: 20,
    backgroundColor: '#0A0C16',
    borderWidth: 1,
    borderColor: CyberTheme.border,
    borderRadius: 6,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 172, 65, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.25)',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    color: CyberTheme.yellow,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  alertDesc: {
    color: CyberTheme.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 15,
  },
  actionBtn: {
    marginVertical: 6,
  },
  enterBtn: {
    shadowColor: CyberTheme.green,
    shadowRadius: 12,
  },
  diagnosticLog: {
    color: '#4F5D75',
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
    fontWeight: 'bold',
  },
});
