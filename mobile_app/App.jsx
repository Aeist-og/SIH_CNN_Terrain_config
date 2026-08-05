import React, { useCallback, useEffect, useState } from 'react';

import Sidebar from './src/components/workspace/Sidebar';
import TopBar from './src/components/workspace/TopBar';
import Dashboard from './src/components/workspace/Dashboard';
import Analyze from './src/components/workspace/Analyze';
import History from './src/components/workspace/History';
import Reports from './src/components/workspace/Reports';
import Settings from './src/components/workspace/Settings';
import CommandPalette from './src/components/workspace/CommandPalette';
import Toast from './src/components/workspace/Toast';
import ContextDrawer from './src/components/workspace/ContextDrawer';
import LandingView from './src/components/workspace/LandingView';
import CommunityView from './src/components/workspace/CommunityView';

import { predictTerrain, checkServerHealth, fetchDbHistory, fetchDbProfile, saveDbProfile } from './src/services/api';
import { TERRAIN_THEMES } from './src/data/terrainData';

const MODEL_VERSION = 'terrain-cnn-v1.2.0';

const getSampleImageUrl = (filename) => {
  if (typeof window === 'undefined') {
    return `/api/samples/${filename}`;
  }
  return `${window.location.origin}/api/samples/${filename}`;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TerrainVision Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0f14] p-6 text-center text-[#f9fafb]">
          <div className="card max-w-md p-8 space-y-4">
            <p className="eyebrow">System notice</p>
            <h2 className="text-xl font-semibold text-[#f9fafb]">Interface Recovery Required</h2>
            <p className="text-sm text-[#9ca3af]">{this.state.error?.toString() || 'An unexpected error occurred.'}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn btn-primary mt-4"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('terrain-user-session');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      username: 'Dr. Aris Thorne',
      role: 'Lead Vision Specialist',
      email: 'dr.thorne@terrainvision.ai'
    };
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedSampleName, setSelectedSampleName] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Initialize history from localStorage first, then sync with SQLite DB
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem('terrain-history-cache');
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }
    return [];
  });

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [toast, setToast] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('terrain-sidebar-collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const triggerToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
  }, []);

  const checkHealth = useCallback(async () => {
    const res = await checkServerHealth();
    setIsServerOnline(res.status === 'online');
  }, []);

  // Database Hydration Effect on Mount & Interval
  useEffect(() => {
    async function hydrateFromDb() {
      const dbHistory = await fetchDbHistory();
      if (dbHistory && Array.isArray(dbHistory) && dbHistory.length > 0) {
        const formattedHistory = dbHistory.map((r) => ({
          terrain: r.predicted_terrain || r.terrain || 'grassy',
          confidence: r.confidence || 0.95,
          timestamp: r.timestamp || new Date().toLocaleTimeString(),
          imageUri: r.imageUri || null,
          sampleName: r.sampleName || null,
          unsupported_image: r.unsupported_image || false,
          implicit: r.implicit_quantities,
          inference_time_ms: r.inference_time_ms || 42,
          gradcam_base64: r.gradcam_base64
        }));
        setHistory(formattedHistory);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('terrain-history-cache', JSON.stringify(formattedHistory));
        }
      }

      const dbProfile = await fetchDbProfile(user.email);
      if (dbProfile) {
        setUser((prev) => ({
          ...prev,
          username: dbProfile.username || prev.username,
          role: dbProfile.role || prev.role
        }));
        if (dbProfile.confidence_threshold) {
          setConfidenceThreshold(dbProfile.confidence_threshold);
        }
      }
    }

    hydrateFromDb();
  }, [user.email]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('terrain-sidebar-collapsed', isSidebarCollapsed ? 'true' : 'false');
    }
  }, [isSidebarCollapsed]);

  const handleNavigate = useCallback((view) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  }, []);

  const runAnalysis = useCallback(
    async (inputParams) => {
      setIsAnalyzing(true);
      setScanResult(null);
      setErrorMessage(null);

      const params = inputParams || {
        sampleName: selectedSampleName,
        base64Image: base64Image,
        imageFile: selectedImageFile
      };

      const result = await predictTerrain(params);
      setIsAnalyzing(false);

      if (result && result.success) {
        const meetsThreshold = (result.confidence || 0) * 100 >= confidenceThreshold;
        const finalUnsupported = result.unsupported_image || !meetsThreshold;

        const finalResult = {
          ...result,
          unsupported_image: finalUnsupported,
          rejection_reason: finalUnsupported
            ? result.rejection_reason || `Classification confidence (${Math.round((result.confidence || 0) * 100)}%) is below the configured ${confidenceThreshold}% threshold.`
            : null
        };

        setScanResult(finalResult);
        const detectedTerrainName = finalResult.predicted_terrain || 'grassy';
        const newHistoryItem = {
          terrain: detectedTerrainName,
          confidence: finalResult.confidence || 0.95,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          imageUri: selectedImageUri || (params.sampleName ? getSampleImageUrl(params.sampleName) : null),
          sampleName: params.sampleName,
          unsupported_image: finalUnsupported,
          implicit: finalResult.implicit,
          inference_time_ms: finalResult.inference_time_ms || 42,
          gradcam_base64: finalResult.gradcam_base64
        };

        setHistory((prev) => {
          const nextHistory = [newHistoryItem, ...prev];
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('terrain-history-cache', JSON.stringify(nextHistory));
          }
          return nextHistory;
        });

        if (finalUnsupported) {
          triggerToast('warning', 'Low Confidence Rejection', `Input image returned confidence below safety threshold (${confidenceThreshold}%).`);
        } else {
          triggerToast('success', 'Analysis Complete', `Terrain identified as ${detectedTerrainName.toUpperCase()} with ${Math.round(finalResult.confidence * 100)}% confidence.`);
        }
      } else {
        const err = result?.error || 'Failed to connect to backend inference server.';
        setErrorMessage(err);
        triggerToast('error', 'Inference Failure', err);
      }
    },
    [selectedSampleName, base64Image, selectedImageFile, selectedImageUri, confidenceThreshold, triggerToast]
  );

  const handleFileDrop = useCallback(
    (event, isDragState) => {
      if (isDragState !== undefined) {
        setIsDragging(isDragState);
        return;
      }

      setIsDragging(false);
      const files = event?.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setSelectedImageFile(file);
          setSelectedSampleName(null);
          const uri = URL.createObjectURL(file);
          setSelectedImageUri(uri);

          const reader = new FileReader();
          reader.onload = (e) => {
            setBase64Image(e.target.result);
          };
          reader.readAsDataURL(file);

          setActiveView('analyze');
          triggerToast('info', 'Image Loaded', `Loaded file: ${file.name}`);
        } else {
          triggerToast('error', 'Invalid File', 'Please upload a valid image file (.jpg, .png, .jpeg, .webp).');
        }
      }
    },
    [triggerToast]
  );

  const handleFileSelect = useCallback(
    (file) => {
      if (!file) return;
      if (file.type.startsWith('image/')) {
        setSelectedImageFile(file);
        setSelectedSampleName(null);
        const uri = URL.createObjectURL(file);
        setSelectedImageUri(uri);

        const reader = new FileReader();
        reader.onload = (e) => {
          setBase64Image(e.target.result);
        };
        reader.readAsDataURL(file);

        setActiveView('analyze');
        triggerToast('info', 'Image Selected', `Loaded ${file.name}`);
      } else {
        triggerToast('error', 'Invalid File', 'Please select a valid image file.');
      }
    },
    [triggerToast]
  );

  const handleSelectSample = useCallback(
    (sampleName) => {
      setSelectedSampleName(sampleName);
      setSelectedImageFile(null);
      setBase64Image(null);
      const uri = getSampleImageUrl(sampleName);
      setSelectedImageUri(uri);
      setActiveView('analyze');
      triggerToast('info', 'Sample Dataset Selected', `Loaded sample: ${sampleName}`);
    },
    [triggerToast]
  );

  const handleClearImage = useCallback(() => {
    setSelectedImageUri(null);
    setSelectedSampleName(null);
    setSelectedImageFile(null);
    setBase64Image(null);
    setScanResult(null);
    setErrorMessage(null);
  }, []);

  const handleQuickAnalyze = useCallback((item) => {
    if (item.sampleName) {
      handleSelectSample(item.sampleName);
    } else if (item.imageUri) {
      setSelectedImageUri(item.imageUri);
      setActiveView('analyze');
    }
  }, [handleSelectSample]);

  const handleUpdateProfile = useCallback((updated) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updated };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('terrain-user-session', JSON.stringify(nextUser));
      }
      saveDbProfile({
        email: nextUser.email,
        username: nextUser.username,
        role: nextUser.role,
        confidence_threshold: confidenceThreshold
      });
      return nextUser;
    });
  }, [confidenceThreshold]);

  const handleSignOut = useCallback(() => {
    setIsLandingPage(true);
    triggerToast('info', 'Signed Out', 'You have been signed out of the operator session.');
  }, [triggerToast]);

  const handleDeleteAccount = useCallback(() => {
    setUser({ username: 'Operator', role: 'Deactivated', email: '' });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('terrain-user-session');
    }
    setHistory([]);
    setScanResult(null);
    setIsLandingPage(true);
    triggerToast('warning', 'Account Purged', 'Your account and session profile have been deleted.');
  }, [triggerToast]);

  const handleLoginSuccess = useCallback((userPayload) => {
    setUser(userPayload);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('terrain-user-session', JSON.stringify(userPayload));
    }
    setIsLandingPage(false);
    triggerToast('success', 'Authenticated', `Welcome back, ${userPayload.username}!`);
  }, [triggerToast]);

  const activeTerrain = scanResult?.predicted_terrain || 'grassy';
  const activeTheme = TERRAIN_THEMES[activeTerrain] || TERRAIN_THEMES.grassy;

  const recentItems = history.slice(0, 4).map((h, idx) => ({
    id: `recent-${idx}`,
    label: `${h.terrain.toUpperCase()} (${Math.round(h.confidence * 100)}%)`,
    sampleName: h.sampleName,
    imageUri: h.imageUri
  }));

  if (isLandingPage) {
    return (
      <LandingView
        onEnterWorkspace={() => setIsLandingPage(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f14] text-[#f9fafb] antialiased selection:bg-[#10b981] selection:text-black">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeView={activeView}
        onNavigate={handleNavigate}
        onNewAnalysis={() => {
          handleClearImage();
          setActiveView('analyze');
        }}
        recentItems={recentItems}
        onQuickAnalyze={handleQuickAnalyze}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        username={user.username}
        role={user.role}
        isServerOnline={isServerOnline}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar
          page={activeView}
          onNavigate={handleNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenContextDrawer={() => setIsContextDrawerOpen(true)}
          username={user.username}
          role={user.role}
          isServerOnline={isServerOnline}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
          {activeView === 'dashboard' && (
            <Dashboard
              isServerOnline={isServerOnline}
              modelVersion={MODEL_VERSION}
              history={history}
              onNavigate={handleNavigate}
              onQuickAnalyze={handleQuickAnalyze}
            />
          )}

          {activeView === 'analyze' && (
            <Analyze
              previewUrl={selectedImageUri}
              isAnalyzing={isAnalyzing}
              isDragging={isDragging}
              onFileDrop={handleFileDrop}
              onFileSelect={handleFileSelect}
              onRunAnalysis={() => runAnalysis()}
              scanResult={scanResult}
              activeTerrain={activeTerrain}
              activeTheme={activeTheme}
              errorMessage={errorMessage}
              sampleLabel={selectedSampleName ? `Sample: ${selectedSampleName}` : null}
              onClearImage={handleClearImage}
              implicit={scanResult?.implicit_quantities}
              onTriggerToast={triggerToast}
              history={history}
            />
          )}

          {activeView === 'history' && (
            <History history={history} onQuickAnalyze={handleQuickAnalyze} onTriggerToast={triggerToast} />
          )}

          {activeView === 'community' && (
            <CommunityView onTriggerToast={triggerToast} currentUser={user} />
          )}

          {activeView === 'reports' && (
            <Reports
              history={history}
              scanResult={scanResult}
              activeTerrain={activeTerrain}
              implicit={scanResult?.implicit_quantities}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'settings' && (
            <Settings
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
              isServerOnline={isServerOnline}
              modelVersion={MODEL_VERSION}
              confidenceThreshold={confidenceThreshold}
              onConfidenceThresholdChange={(val) => setConfidenceThreshold(val)}
              onTriggerToast={triggerToast}
            />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onSelectSample={handleSelectSample}
      />

      <ContextDrawer
        isOpen={isContextDrawerOpen}
        onClose={() => setIsContextDrawerOpen(false)}
        scanResult={scanResult}
        modelVersion={MODEL_VERSION}
        isServerOnline={isServerOnline}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
