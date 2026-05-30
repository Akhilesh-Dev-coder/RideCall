import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { useAppStore, AssistantStateType } from '../store/useAppStore';

const { RideCallModule } = NativeModules;

export const useNativeEvents = () => {
  const setIncomingCall = useAppStore((state) => state.setIncomingCall);
  const setCallState = useAppStore((state) => state.setCallState);
  const setAssistantState = useAppStore((state) => state.setAssistantState);
  const setRmsValue = useAppStore((state) => state.setRmsValue);
  const addCallLog = useAppStore((state) => state.addCallLog);
  const setTwsConnected = useAppStore((state) => state.setTwsConnected);
  const checkTwsStatus = useAppStore((state) => state.checkTwsStatus);
  const checkDialerStatus = useAppStore((state) => state.checkDialerStatus);
  const setScreen = useAppStore((state) => state.setScreen);
  const isMockCall = useAppStore((state) => state.isMockCall);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Do initial checks on mount
    checkTwsStatus();
    checkDialerStatus();

    const eventEmitter = new NativeEventEmitter(RideCallModule);

    // 1. Listen for incoming call detected by InCallService
    const incomingCallSub = eventEmitter.addListener('onIncomingCall', (data) => {
      console.log('Native Event: onIncomingCall', data);
      setIncomingCall(data.phoneNumber, data.callerName, !!data.isMock);
    });

    // 2. Listen for call states (e.g. active, dialing, disconnected)
    const callStateChangedSub = eventEmitter.addListener('onCallStateChanged', (data) => {
      console.log('Native Event: onCallStateChanged', data);
      // State 7: Call.STATE_DISCONNECTED
      if (data.state === 7) {
        setCallState(false);
        setScreen('home');
      }
    });

    // 3. Listen for assistant flow notifications
    const ttsStartedSub = eventEmitter.addListener('onTTSStarted', () => {
      setAssistantState('announcing');
    });

    const ttsFinishedSub = eventEmitter.addListener('onTTSFinished', () => {
      setAssistantState('listening');
    });

    const listeningStartedSub = eventEmitter.addListener('onListeningStarted', () => {
      setAssistantState('listening');
    });

    const speechBeganSub = eventEmitter.addListener('onSpeechBegan', () => {
      setAssistantState('listening');
    });

    const speechRmsChangedSub = eventEmitter.addListener('onSpeechRmsChanged', (data) => {
      // rmsdB usually ranges from negative to about 10. Normalize it for visualizer
      setRmsValue(data.value);
    });

    const speechErrorSub = eventEmitter.addListener('onSpeechError', (data) => {
      console.log('Native Event: onSpeechError code', data.errorCode);
      setRmsValue(-2.0);
    });

    const speechTimeoutSub = eventEmitter.addListener('onSpeechTimeout', () => {
      setAssistantState('timeout');
      setRmsValue(-2.0);
    });

    // 4. Call answered/rejected results
    const callAnsweredSub = eventEmitter.addListener('onCallAnswered', () => {
      addCallLog('answered');
      setAssistantState('answering');
      setRmsValue(-2.0);
      
      // Keep call overlay visible for a bit then let background activity run
      setTimeout(() => {
        // Return to home, active call state will still run
        setScreen('home');
        setCallState(false);
      }, 2000);
    });

    const callRejectedSub = eventEmitter.addListener('onCallRejected', () => {
      addCallLog('rejected');
      setAssistantState('rejecting');
      setRmsValue(-2.0);
      
      setTimeout(() => {
        setScreen('home');
        setCallState(false);
      }, 1500);
    });

    // 5. Bluetooth connection status
    const bluetoothStatusSub = eventEmitter.addListener('onBluetoothStatusChanged', (data) => {
      console.log('Native Event: onBluetoothStatusChanged', data);
      setTwsConnected(data.connected, data.deviceName);
    });

    // Cleanup subscriptions on unmount
    return () => {
      incomingCallSub.remove();
      callStateChangedSub.remove();
      ttsStartedSub.remove();
      ttsFinishedSub.remove();
      listeningStartedSub.remove();
      speechBeganSub.remove();
      speechRmsChangedSub.remove();
      speechErrorSub.remove();
      speechTimeoutSub.remove();
      callAnsweredSub.remove();
      callRejectedSub.remove();
      bluetoothStatusSub.remove();
    };
  }, []);
};
