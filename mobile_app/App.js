import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,

  Platform
} from 'react-native';

import Header from './src/components/Header';
import ImplicitQuantitiesCard from './src/components/ImplicitQuantitiesCard';
import RoverTelemetry from './src/components/RoverTelemetry';
import ScanHistory from './src/components/ScanHistory';

import { predictTerrain, checkServerHealth } from './src/services/api';
import { TERRAIN_THEMES, SAMPLE_IMAGES } from './src/data/terrainData';

// Map sample names to local static paths for instant crisp display
const SAMPLE_IMAGE_URLS = {
  'test_1.jpg': 'http://localhost:5000/api/samples/test_1.jpg',
  'test_2.jpg': 'http://localhost:5000/api/samples/test_2.jpg',
  'test_3.jpg': 'http://localhost:5000/api/samples/test_3.jpg',
  'test_4.jpg': 'http://localhost:5000/api/samples/test_4.jpg',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [isServerOnline, setIsServerOnline] = useState(false);

  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedSampleName, setSelectedSampleName] = useState(null);
  const [base64Image, setBase64Image] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Check Flask API health on launch
  useEffect(() => {
    checkServerHealth().then((res) => {
      setIsServerOnline(res.status === 'online');
    });
  }, []);

  // Handle image upload from web or native
  const handleFileUpload = (event) => {
    if (Platform.OS === 'web') {
      const file = event.target?.files?.[0];
      if (file) {
        const uri = URL.createObjectURL(file);
        setSelectedImageUri(uri);
        setSelectedSampleName(null);

        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Image(reader.result);
          runAnalysis({ imageUri: uri, base64Image: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Select sample image
  const handleSelectSample = (sample) => {
    const uri = SAMPLE_IMAGE_URLS[sample.sample_name] || `http://localhost:5000/api/samples/${sample.sample_name}`;
    setSelectedImageUri(uri);
    setSelectedSampleName(sample.sample_name);
    setBase64Image(null);
    runAnalysis({ imageUri: uri, sampleName: sample.sample_name });
  };

  // Run CNN Terrain Recognition Analysis
  const runAnalysis = async (inputParams) => {
    setIsAnalyzing(true);
    setScanResult(null);

    const result = await predictTerrain(inputParams);

    setIsAnalyzing(false);
    if (result && result.success) {
      setScanResult(result);

      // Add to session history
      const newHistoryItem = {
        terrain: result.predicted_terrain,
        confidence: result.confidence,
        imageUri: inputParams.imageUri,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resultData: result
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 15)]);
    }
  };

  // Re-run for active image
  const handleTriggerPredict = () => {
    if (selectedSampleName) {
      runAnalysis({ imageUri: selectedImageUri, sampleName: selectedSampleName });
    } else if (selectedImageUri) {
      runAnalysis({ imageUri: selectedImageUri, base64Image });
    } else {
      // Default to Sample 1
      handleSelectSample(SAMPLE_IMAGES[0]);
    }
  };

  const activeTheme = scanResult ? (TERRAIN_THEMES[scanResult.predicted_terrain] || TERRAIN_THEMES.grassy) : TERRAIN_THEMES.grassy;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <Header isServerOnline={isServerOnline} />

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'scanner' && styles.tabButtonActive]}
          onPress={() => setActiveTab('scanner')}
        >
          <Text style={[styles.tabText, activeTab === 'scanner' && styles.tabTextActive]}>📷 Vision Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'implicit' && styles.tabButtonActive]}
          onPress={() => setActiveTab('implicit')}
        >
          <Text style={[styles.tabText, activeTab === 'implicit' && styles.tabTextActive]}>📊 Implicit Quantities</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'telemetry' && styles.tabButtonActive]}
          onPress={() => setActiveTab('telemetry')}
        >
          <Text style={[styles.tabText, activeTab === 'telemetry' && styles.tabTextActive]}>🤖 Rover Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>📜 Scan Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TAB 1: SCANNER */}
        {activeTab === 'scanner' && (
          <View style={styles.tabContent}>
            {/* Image Preview / Upload Area */}
            <View style={styles.previewContainer}>
              {selectedImageUri ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: selectedImageUri }} style={styles.previewImage} resizeMode="cover" />

                  {/* Scanning Animation Grid Overlay */}
                  {isAnalyzing && (
                    <View style={styles.scanOverlay}>
                      <ActivityIndicator size="large" color="#38bdf8" />
                      <Text style={styles.scanText}>CNN Neural Feature Extraction...</Text>
                    </View>
                  )}

                  {/* Recognition Result Badge overlay */}
                  {scanResult && !isAnalyzing && (
                    <View style={[styles.resultBadge, { backgroundColor: activeTheme.color }]}>
                      <Text style={styles.resultBadgeText}>
                        {scanResult.predicted_terrain.toUpperCase()} ({(scanResult.confidence * 100).toFixed(1)}%)
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderIcon}>🛰️</Text>
                  <Text style={styles.placeholderTitle}>Select or Upload Aerial Terrain Image</Text>
                  <Text style={styles.placeholderSubtitle}>
                    Vision CNN will perform automatic classification & calculate physical quantities
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {Platform.OS === 'web' && (
                  <label style={webStyles.uploadLabel}>
                    <Text style={styles.buttonText}>📁 Upload Image File</Text>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                <TouchableOpacity
                  style={[styles.predictBtn, isAnalyzing && styles.btnDisabled]}
                  onPress={handleTriggerPredict}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.predictBtnText}>⚡ Run CNN Recognition</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Preset Samples Picker */}
            <View style={styles.sampleSection}>
              <Text style={styles.sectionTitle}>Preset Sample Terrains (1-Tap Test)</Text>
              <View style={styles.sampleGrid}>
                {SAMPLE_IMAGES.map((sample) => {
                  const isSelected = selectedSampleName === sample.sample_name;
                  const sampleUrl = SAMPLE_IMAGE_URLS[sample.sample_name];
                  return (
                    <TouchableOpacity
                      key={sample.id}
                      style={[styles.sampleCard, isSelected && styles.sampleCardSelected]}
                      onPress={() => handleSelectSample(sample)}
                    >
                      <Image source={{ uri: sampleUrl }} style={styles.sampleThumb} />
                      <Text style={styles.sampleName}>{sample.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Prediction Breakdown Card */}
            {scanResult && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardLabel}>CLASSIFICATION RESULT</Text>
                    <Text style={[styles.detectedTitle, { color: activeTheme.color }]}>
                      {activeTheme.label}
                    </Text>
                  </View>
                  <View style={[styles.confPill, { backgroundColor: activeTheme.badgeBg }]}>
                    <Text style={[styles.confPillText, { color: activeTheme.badgeText }]}>
                      {(scanResult.confidence * 100).toFixed(1)}% Confidence
                    </Text>
                  </View>
                </View>

                {/* Probabilities distribution */}
                <Text style={styles.probHeader}>CNN Class Probability Distribution:</Text>
                {Object.entries(scanResult.probabilities || {}).map(([clsName, prob]) => {
                  const theme = TERRAIN_THEMES[clsName] || TERRAIN_THEMES.grassy;
                  const pct = Math.round(prob * 100);
                  return (
                    <View key={clsName} style={styles.probRow}>
                      <Text style={styles.probClassLabel}>{clsName.toUpperCase()}</Text>
                      <View style={styles.probTrack}>
                        <View style={[styles.probFill, { width: `${pct}%`, backgroundColor: theme.color }]} />
                      </View>
                      <Text style={styles.probVal}>{pct}%</Text>
                    </View>
                  );
                })}

                <Text style={styles.engineMeta}>Source: {scanResult.source}</Text>
              </View>
            )}

            {/* Quick Preview of Implicit Quantities */}
            {scanResult && (
              <ImplicitQuantitiesCard
                terrain={scanResult.predicted_terrain}
                implicit={scanResult.implicit}
              />
            )}
          </View>
        )}

        {/* TAB 2: IMPLICIT QUANTITIES */}
        {activeTab === 'implicit' && (
          <View style={styles.tabContent}>
            {scanResult ? (
              <ImplicitQuantitiesCard
                terrain={scanResult.predicted_terrain}
                implicit={scanResult.implicit}
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyTitle}>No Active Scan Data</Text>
                <Text style={styles.emptySubtitle}>
                  Please upload an image or pick a sample terrain in the Vision Scanner tab to extract roughness, slipperiness, and bearing metrics.
                </Text>
                <TouchableOpacity
                  style={styles.sampleBtn}
                  onPress={() => {
                    setActiveTab('scanner');
                    handleSelectSample(SAMPLE_IMAGES[0]);
                  }}
                >
                  <Text style={styles.sampleBtnText}>Test Sample 1 (Rocky)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: ROVER MODE */}
        {activeTab === 'telemetry' && (
          <View style={styles.tabContent}>
            {scanResult ? (
              <RoverTelemetry
                terrain={scanResult.predicted_terrain}
                implicit={scanResult.implicit}
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyTitle}>No Active Scan Data</Text>
                <Text style={styles.emptySubtitle}>
                  Perform a terrain recognition scan first to generate rover traversal protocols and speed limit telemetry.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: SCAN HISTORY */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <ScanHistory
              history={history}
              onSelectHistoryItem={(item) => {
                setScanResult(item.resultData);
                setSelectedImageUri(item.imageUri);
                setActiveTab('scanner');
              }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const webStyles = {
  uploadLabel: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#38bdf8',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    gap: 14,
  },
  previewContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  imageWrapper: {
    position: 'relative',
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  scanText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  resultBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  placeholderBox: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  placeholderTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderSubtitle: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  predictBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  predictBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  sampleSection: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  sampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sampleCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  sampleThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  sampleName: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  detectedTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  confPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  probHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  probClassLabel: {
    width: 65,
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  probTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  probFill: {
    height: '100%',
    borderRadius: 3,
  },
  probVal: {
    width: 32,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'right',
  },
  engineMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 12,
  },
  sampleBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sampleBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
