import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TERRAIN_THEMES } from '../data/terrainData';

export default function ImplicitQuantitiesCard({ terrain, implicit }) {
  if (!implicit) return null;

  const theme = TERRAIN_THEMES[terrain] || TERRAIN_THEMES.grassy;

  const roughness = implicit.roughness || {};
  const slipperiness = implicit.slipperiness || {};
  const treacherousness = implicit.treacherousness || {};
  const vegetation = implicit.vegetation || {};
  const hydration = implicit.hydration || {};
  const stability = implicit.surface_stability || {};

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Implicit Physical Quantities</Text>
        <Text style={styles.cardSubtitle}>High-Level Environmental & Mechanical Attributes</Text>
      </View>

      <View style={styles.gridContainer}>
        {/* Roughness Metric */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Surface Roughness (Ra)</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#f87171' }]}>{roughness.qualitative || 'Low'}</Text>
            </View>
          </View>
          <Text style={styles.metricValue}>
            {roughness.value_ra ? `${roughness.value_ra} µm` : '0.25 µm'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.fillBar, { width: `${roughness.score || 30}%`, backgroundColor: '#ef4444' }]} />
          </View>
          <Text style={styles.metricDesc}>{roughness.description}</Text>
        </View>

        {/* Slipperiness / Friction Metric */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Slipperiness (Friction μ)</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#38bdf8' }]}>{slipperiness.qualitative || 'Moderate'}</Text>
            </View>
          </View>
          <Text style={styles.metricValue}>
            μ = {slipperiness.friction_coefficient !== undefined ? slipperiness.friction_coefficient : 0.55}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.fillBar, { width: `${slipperiness.score || 40}%`, backgroundColor: '#0284c7' }]} />
          </View>
          <Text style={styles.metricDesc}>{slipperiness.description}</Text>
        </View>

        {/* Treacherousness / Hazard */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Treacherousness / Risk</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#fbbf24' }]}>
                Lvl {treacherousness.hazard_level || 1} / 5
              </Text>
            </View>
          </View>
          <Text style={styles.metricValue}>{treacherousness.qualitative || 'Low'}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.fillBar, { width: `${treacherousness.score || 20}%`, backgroundColor: '#f59e0b' }]} />
          </View>
          <Text style={styles.metricDesc}>{treacherousness.description}</Text>
        </View>

        {/* Surface Stability & Bearing Capacity */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Bearing Capacity</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: '#34d399' }]}>{stability.status || 'Stable'}</Text>
            </View>
          </View>
          <Text style={styles.metricValue}>
            {stability.bearing_capacity_kpa ? `${stability.bearing_capacity_kpa} kN/m²` : '180 kN/m²'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.fillBar, { width: `${stability.score || 85}%`, backgroundColor: '#10b981' }]} />
          </View>
          <Text style={styles.metricDesc}>Maximum structural payload support capability.</Text>
        </View>

        {/* Hydration & Moisture */}
        <View style={styles.metricCardRow}>
          <View style={styles.halfCol}>
            <Text style={styles.metricLabel}>Environmental Moisture</Text>
            <Text style={styles.smallMetricVal}>{hydration.moisture_pct || 30}%</Text>
            <Text style={styles.subQual}>{hydration.qualitative} Hydration</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.halfCol}>
            <Text style={styles.metricLabel}>Vegetation Density</Text>
            <Text style={styles.smallMetricVal}>{vegetation.density_pct || 75}%</Text>
            <Text style={styles.subQual}>{vegetation.qualitative} Cover</Text>
          </View>
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
  gridContainer: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginVertical: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginVertical: 6,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 3,
  },
  metricDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
  },
  metricCardRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  halfCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  smallMetricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38bdf8',
    marginTop: 4,
  },
  subQual: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});
