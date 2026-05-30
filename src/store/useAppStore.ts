import { create } from 'zustand';
import { NativeModules, Platform } from 'react-native';

const { RideCallModule } = NativeModules;

export interface CallLog {
  id: string;
  callerName: string;
  callerNumber: string;
  action: 'answered' | 'rejected';
  timestamp: string;
}

export interface AppSettings {
  ttsSpeed: number;        // 0.5 to 2.0
  autoRepeat: boolean;      // Repeat prompt once if no response
  responseTimeout: number; // in milliseconds (e.g. 8000)
  customSmsMessage: string;
  smsReplyEnabled: boolean;
}

export type ScreenType = 'welcome' | 'permissions' | 'home' | 'settings' | 'incoming_call';
export type AssistantStateType = 'idle' | 'announcing' | 'listening' | 'answering' | 'rejecting' | 'timeout' | 'error';

interface AppState {
  // Navigation
  currentScreen: ScreenType;
  onboardingCompleted: boolean;
  
  // HUD Statuses
  helmetModeActive: boolean;
  twsConnected: boolean;
  twsDeviceName: string;
  defaultDialerActive: boolean;
  
  // Call Info
  isCallActive: boolean;
  callerName: string;
  callerNumber: string;
  isMockCall: boolean;
  assistantState: AssistantStateType;
  rmsValue: number; // microphone visualizer decibels
  
  // Call Log
  recentCalls: CallLog[];
  
  // Configurations
  settings: AppSettings;
  
  // Actions
  setScreen: (screen: ScreenType) => void;
  completeOnboarding: () => void;
  setHelmetModeActive: (active: boolean) => Promise<void>;
  setTwsConnected: (connected: boolean, deviceName?: string) => void;
  setDefaultDialerActive: (active: boolean) => void;
  checkTwsStatus: () => Promise<void>;
  checkDialerStatus: () => Promise<void>;
  requestDialerRole: () => Promise<void>;
  
  // Calling actions
  setIncomingCall: (phoneNumber: string, callerName: string, isMock?: boolean) => void;
  setCallState: (isCallActive: boolean) => void;
  setAssistantState: (state: AssistantStateType) => void;
  setRmsValue: (value: number) => void;
  addCallLog: (action: 'answered' | 'rejected') => void;
  manualAnswer: () => Promise<void>;
  manualReject: () => Promise<void>;
  
  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  triggerMockCall: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  ttsSpeed: 1.0,
  autoRepeat: true,
  responseTimeout: 8000,
  customSmsMessage: "I am currently riding. I will call you back later.",
  smsReplyEnabled: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'welcome',
  onboardingCompleted: false,
  
  helmetModeActive: false,
  twsConnected: false,
  twsDeviceName: '',
  defaultDialerActive: false,
  
  isCallActive: false,
  callerName: '',
  callerNumber: '',
  isMockCall: false,
  assistantState: 'idle',
  rmsValue: -2.0,
  
  recentCalls: [],
  settings: DEFAULT_SETTINGS,
  
  setScreen: (screen) => set({ currentScreen: screen }),
  
  completeOnboarding: () => set({ onboardingCompleted: true, currentScreen: 'permissions' }),
  
  setHelmetModeActive: async (active) => {
    if (Platform.OS !== 'android') return;
    try {
      if (active) {
        await RideCallModule.startForegroundService();
        set({ helmetModeActive: true });
      } else {
        await RideCallModule.stopForegroundService();
        set({ helmetModeActive: false });
      }
    } catch (e) {
      console.error('Failed to toggle helmet mode foreground service:', e);
    }
  },
  
  setTwsConnected: (connected, deviceName = 'TWS Earbuds') => {
    set({
      twsConnected: connected,
      twsDeviceName: connected ? deviceName : '',
    });
  },
  
  setDefaultDialerActive: (active) => set({ defaultDialerActive: active }),
  
  checkTwsStatus: async () => {
    if (Platform.OS !== 'android') return;
    try {
      const isConnected = await RideCallModule.isBluetoothConnected();
      set({ 
        twsConnected: isConnected,
        twsDeviceName: isConnected ? 'Bluetooth Headset' : ''
      });
    } catch (e) {
      console.error('Error checking bluetooth connection:', e);
    }
  },
  
  checkDialerStatus: async () => {
    if (Platform.OS !== 'android') return;
    try {
      const isDefault = await RideCallModule.checkDefaultDialer();
      set({ defaultDialerActive: isDefault });
    } catch (e) {
      console.error('Error checking dialer status:', e);
    }
  },
  
  requestDialerRole: async () => {
    if (Platform.OS !== 'android') return;
    try {
      const requested = await RideCallModule.requestDefaultDialer();
      if (requested) {
        // We check periodically or rely on Activity callbacks, but we can do a quick check
        setTimeout(async () => {
          const isDefault = await RideCallModule.checkDefaultDialer();
          set({ defaultDialerActive: isDefault });
        }, 1500);
      }
    } catch (e) {
      console.error('Error requesting default dialer:', e);
    }
  },
  
  setIncomingCall: (phoneNumber, callerName, isMock = false) => {
    set({
      isCallActive: true,
      callerNumber: phoneNumber,
      callerName: callerName || phoneNumber || 'Unknown',
      isMockCall: isMock,
      assistantState: 'announcing',
      currentScreen: 'incoming_call',
    });
  },
  
  setCallState: (isCallActive) => {
    if (!isCallActive) {
      set({
        isCallActive: false,
        callerNumber: '',
        callerName: '',
        isMockCall: false,
        assistantState: 'idle',
        rmsValue: -2.0,
      });
    } else {
      set({ isCallActive: true });
    }
  },
  
  setAssistantState: (state) => set({ assistantState: state }),
  
  setRmsValue: (value) => set({ rmsValue: value }),
  
  addCallLog: (action) => {
    const { callerName, callerNumber } = get();
    if (!callerName && !callerNumber) return;
    
    const newLog: CallLog = {
      id: Math.random().toString(36).substring(2, 9),
      callerName: callerName,
      callerNumber: callerNumber,
      action: action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    set((state) => ({
      recentCalls: [newLog, ...state.recentCalls.slice(0, 19)], // Cap logs at 20 items
    }));
  },
  
  manualAnswer: async () => {
    const { isMockCall, addCallLog, setCallState } = get();
    if (isMockCall) {
      addCallLog('answered');
      set({ assistantState: 'idle', isMockCall: false });
      // Wait a moment then dismiss the call screen
      setTimeout(() => {
        set({ currentScreen: 'home', isCallActive: false });
        setCallState(false);
      }, 2000);
    } else {
      if (Platform.OS === 'android') {
        try {
          await RideCallModule.answerCall();
        } catch (e) {
          console.error('Manual answer failed:', e);
        }
      }
    }
  },
  
  manualReject: async () => {
    const { isMockCall, addCallLog, setCallState } = get();
    if (isMockCall) {
      addCallLog('rejected');
      set({ assistantState: 'idle', isMockCall: false });
      setTimeout(() => {
        set({ currentScreen: 'home', isCallActive: false });
        setCallState(false);
      }, 1000);
    } else {
      if (Platform.OS === 'android') {
        try {
          await RideCallModule.rejectCall();
        } catch (e) {
          console.error('Manual reject failed:', e);
        }
      }
    }
  },
  
  updateSettings: (newSettings) => {
    set((state) => {
      const mergedSettings = { ...state.settings, ...newSettings };
      
      // Push settings to Android native storage cache
      if (Platform.OS === 'android') {
        RideCallModule.syncSettings(mergedSettings);
      }
      
      return { settings: mergedSettings };
    });
  },
  
  triggerMockCall: async () => {
    if (Platform.OS === 'android') {
      try {
        await RideCallModule.triggerTestCall();
      } catch (e) {
        console.error('Error triggering mock call:', e);
        // Fallback to JS-only mock call if native module fails or on emulator
        get().setIncomingCall('+91 98765 43210', 'Arun (Mock Rider)', true);
      }
    } else {
      // iOS / Web testing fallback
      get().setIncomingCall('+1 555-0199', 'Arun (Mock Rider)', true);
    }
  },
}));
