import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, GestureResponderEvent } from 'react-native';
import { CyberTheme } from '../constants/theme';

interface CyberButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  type?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  // Map types to theme colors
  let color: string = CyberTheme.cyan;
  let shadowStyle: any = CyberTheme.glowCyan;
  
  if (type === 'success') {
    color = CyberTheme.green;
    shadowStyle = CyberTheme.glowGreen;
  } else if (type === 'danger') {
    color = CyberTheme.red;
    shadowStyle = CyberTheme.glowRed;
  } else if (type === 'warning') {
    color = CyberTheme.yellow;
    shadowStyle = { ...CyberTheme.glowCyan, shadowColor: CyberTheme.yellow };
  } else if (type === 'secondary') {
    color = CyberTheme.textSecondary;
    shadowStyle = { ...CyberTheme.glowCyan, shadowColor: 'transparent', elevation: 0 };
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { borderColor: color },
        !disabled && shadowStyle,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {/* Decorative corner cutouts for cyber/military aesthetic */}
      <View style={[styles.corner, styles.topLeft, { borderTopColor: color, borderLeftColor: color }]} />
      <View style={[styles.corner, styles.topRight, { borderTopColor: color, borderRightColor: color }]} />
      <View style={[styles.corner, styles.bottomLeft, { borderBottomColor: color, borderLeftColor: color }]} />
      <View style={[styles.corner, styles.bottomRight, { borderBottomColor: color, borderRightColor: color }]} />

      <Text
        style={[
          styles.text,
          { color: disabled ? '#4F5D75' : color },
          textStyle,
        ]}
      >
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 4,
    backgroundColor: '#0F121C', // Dark space container
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
    width: '100%',
  },
  disabledButton: {
    borderColor: '#2D3748',
    backgroundColor: '#0A0E17',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  topLeft: {
    top: -1.5,
    left: -1.5,
  },
  topRight: {
    top: -1.5,
    right: -1.5,
  },
  bottomLeft: {
    bottom: -1.5,
    left: -1.5,
  },
  bottomRight: {
    bottom: -1.5,
    right: -1.5,
  },
});
