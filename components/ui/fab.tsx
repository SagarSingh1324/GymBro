import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FABProps {
  style?: any;
  icon?: string;
  label: string;
  onPress: () => void;
}

const FAB: React.FC<FABProps> = ({ style, icon, label, onPress }) => (
  <TouchableOpacity style={[styles.fabButton, style]} onPress={onPress}>
    <Text style={styles.fabText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fabButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FAB;