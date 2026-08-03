import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { TERRAIN_THEMES } from '../data/terrainData';

export default function ScanHistory({ history, onSelectHistoryItem }) {
  if (!history || history.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan History Log</Text>
        <Text style={styles.emptyText}>No terrain scans logged in this session yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent Terrain Scans ({history.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {history.map((item, idx) => {
          const theme = TERRAIN_THEMES[item.terrain] || TERRAIN_THEMES.grassy;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.historyCard, { borderColor: theme.color }]}
              onPress={() => onSelectHistoryItem(item)}
            >
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: theme.lightColor, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 18 }}>🗻</Text>
                </View>
              )}
              <View style={styles.itemMeta}>
                <Text style={[styles.terrainName, { color: theme.color }]}>
                  {item.terrain.toUpperCase()}
                </Text>
                <Text style={styles.confidenceText}>
                  {(item.confidence * 100).toFixed(1)}% Conf
                </Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  scroll: {
    flexDirection: 'row',
  },
  historyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    width: 140,
    borderWidth: 1,
  },
  thumb: {
    width: '100%',
    height: 75,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemMeta: {
    gap: 2,
  },
  terrainName: {
    fontSize: 11,
    fontWeight: '800',
  },
  confidenceText: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  timeText: {
    fontSize: 9,
    color: '#64748b',
  },
});
