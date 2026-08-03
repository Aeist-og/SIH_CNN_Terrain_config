import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header({ isServerOnline }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoTextIcon}>⚡</Text>
        </View>
        <View>
          <Text style={styles.title}>TerrainVision AI</Text>
          <Text style={styles.subtitle}>CNN Recognition & Implicit Quantities</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, isServerOnline ? styles.onlineBadge : styles.offlineBadge]}>
        <View style={[styles.statusDot, isServerOnline ? styles.onlineDot : styles.offlineDot]} />
        <Text style={[styles.statusText, isServerOnline ? styles.onlineText : styles.offlineText]}>
          {isServerOnline ? 'CNN API LIVE' : 'CLIENT AI'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoTextIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  onlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onlineText: {
    color: '#34d399',
  },
  offlineText: {
    color: '#fbbf24',
  },
});
