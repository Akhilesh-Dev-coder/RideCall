import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CyberTheme } from '../constants/theme';

interface StatusPillProps {
  label: string;
  value: string;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  style?: any;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  value,
  status = 'inactive',
  style,
}) => {
  let color: string = CyberTheme.textSecondary;
  let glowColor: string = 'transparent';
  
  if (status === 'active') {
    color = CyberTheme.green;
    glowColor = CyberTheme.green;
  } else if (status === 'inactive') {
    color = CyberTheme.textSecondary;
    glowColor = 'transparent';
  } else if (status === 'warning') {
    color = CyberTheme.yellow;
    glowColor = CyberTheme.yellow;
  } else if (status === 'error') {
    color = CyberTheme.red;
    glowColor = CyberTheme.red;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={[styles.badge, { borderColor: color }]}>
        {status !== 'inactive' && (
          <View
            style={[
              styles.dot,
              { backgroundColor: color },
              {
                shadowColor: glowColor,
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 4,
              },
            ]}
          />
        )}
        <Text style={[styles.value, { color: color }]}>{value.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171B26',
    width: '100%',
  },
  label: {
    color: '#6F7E9B', // Gray-blue cockpit label
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#0F121C',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
