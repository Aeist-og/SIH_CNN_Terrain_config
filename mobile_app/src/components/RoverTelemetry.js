import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TERRAIN_THEMES } from '../data/terrainData';

export default function RoverTelemetry({ terrain, implicit }) {
  if (!implicit) return null;

  const theme = TERRAIN_THEMES[terrain] || TERRAIN_THEMES.grassy;
  const telemetry = implicit.perception_telemetry || {};

  const safetyIndex = telemetry.traversal_safety_index || 85;
  const maxSpeed = telemetry.recommended_max_speed_kmh || 30;
  const gripIndex = telemetry.wheel_grip_index || 75;
  const driveMode = telemetry.recommended_drive_mode || 'Standard Mode';

  let safetyColor = '#10b981'; // green
  if (safetyIndex < 50) {
    safetyColor = '#ef4444'; // red
  } else if (safetyIndex < 75) {
    safetyColor = '#f59e0b'; // amber
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Navigation & Traversal Telemetry</Text>
        <Text style={styles.cardSubtitle}>Autonomous Vehicle / Rover Environment Perception</Text>
      </View>

      <View style={styles.topRow}>
        <View style={[styles.gaugeBox, { borderColor: safetyColor }]}>
          <Text style={[styles.gaugeScore, { color: safetyColor }]}>{safetyIndex}%</Text>
          <Text style={styles.gaugeLabel}>Safety Index</Text>
        </View>

        <View style={styles.modeBox}>
          <Text style={styles.modeLabel}>RECOMMENDED DRIVE MODE</Text>
          <Text style={[styles.modeValue, { color: theme.color }]}>{driveMode}</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Max Speed: {maxSpeed} km/h</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Wheel Traction: {gripIndex}%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.protocolList}>
        <Text style={styles.protocolTitle}>System Action Protocols:</Text>
        <View style={styles.protocolItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.protocolText}>
            Adjust active suspension height based on surface roughness ($Ra = {implicit.roughness?.value_ra || 0.25} µm$).
          </Text>
        </View>
        <View style={styles.protocolItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.protocolText}>
            Calibrate anti-lock braking threshold for slipperiness ($\mu = {implicit.slipperiness?.friction_coefficient || 0.55}$).
          </Text>
        </View>
        <View style={styles.protocolItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.protocolText}>
            Enforce safety perimeter margin for terrain treacherousness rating.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
    marginBottom: 14,
  },
  gaugeBox: {
    width: 100,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  gaugeScore: {
    fontSize: 24,
    fontWeight: '900',
  },
  gaugeLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
    fontWeight: '600',
  },
  modeBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
  },
  modeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  modeValue: {
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  protocolList: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  protocolTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 2,
  },
  protocolItem: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  protocolText: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
    lineHeight: 16,
  },
});
