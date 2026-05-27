import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeaderTopBar } from './components/layout/HeaderTopBar';
import { Sidebar } from './components/layout/Sidebar';
import { EditorArea } from './components/editor/EditorArea';
import { ResultArea } from './components/result/ResultArea';
import { MistakesPanel } from './components/result/MistakesPanel';
import { useTextAnalyzer } from './hooks/useTextAnalyzer';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

function MainAnalyzerApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  // Automatically manage sidebar state when crossing breakpoints
  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasDesktop = prevWidth >= 768;
      const isDesktop = currentWidth >= 768;
      
      if (wasDesktop !== isDesktop) {
        setIsSidebarOpen(isDesktop);
      }
      prevWidth = currentWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    inputText,
    setInputText,
    outputText,
    setOutputText,
    isLoading,
    getStats,
    handleClear,
    handleMainAction,
    handleResultAction,
    handleFileUploadAction,
    selectedMode,
    setSelectedMode,
    outputLang,
    setOutputLang,
    mistakes,
    isAssistantOpen,
    setIsAssistantOpen,
    applyCorrection,
    aiAnalysis,
    assistantResult,
    isAssistantLoading,
    handleAssistantDescribe,
    handleAssistantKeywords,
    handleAssistantImprove,
    dismissMistake,
    history,
    deleteHistoryItem,
    clearHistory,
    loadFromHistory,
    uploadedFile,
    viewMode,
    setViewMode,
    zoom,
    setZoom,
    lastInputText,
    handleUndo,
    handleEditorAction
  } = useTextAnalyzer();

  return (
    <div className="h-screen w-full flex flex-col bg-background text-text overflow-hidden">
      <HeaderTopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0'} md:relative absolute top-0 left-0 z-40 h-full flex-shrink-0 overflow-hidden`}>
          <div className="w-64 h-full">
            <Sidebar 
              isLoading={isLoading}
              disabled={!inputText || inputText.length > 5000}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              onMainAction={handleMainAction}
              isAssistantOpen={isAssistantOpen}
              setIsAssistantOpen={setIsAssistantOpen}
              history={history}
              onDeleteHistoryItem={deleteHistoryItem}
              onClearHistory={clearHistory}
              onLoadHistoryItem={loadFromHistory}
              uploadedFile={uploadedFile}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
            {/* Left Column - Input */}
            <div className="flex-1 flex flex-col min-w-0 min-h-[400px]">
              <EditorArea
                text={inputText}
                setText={setInputText}
                stats={getStats(inputText)}
                onClear={handleClear}
                isLoading={isLoading}
                onFileUploadAction={handleFileUploadAction}
                mistakes={mistakes}
                applyCorrection={applyCorrection}
                dismissMistake={dismissMistake}
                uploadedFile={uploadedFile}
                viewMode={viewMode}
                setViewMode={setViewMode}
                zoom={zoom}
                setZoom={setZoom}
                selectedMode={selectedMode}
                onAction={handleEditorAction}
                onUndo={handleUndo}
                canUndo={lastInputText !== null}
              />
            </div>

            {/* Middle Column - Result */}
            {selectedMode !== 'analyze' && (
              <div className="flex-1 flex flex-col min-w-0 min-h-[400px]">
                <ResultArea
                  text={outputText}
                  setText={setOutputText}
                  stats={getStats(outputText)}
                  isLoading={isLoading}
                  outputLang={outputLang}
                  setOutputLang={setOutputLang}
                  selectedMode={selectedMode}
                  onAction={handleResultAction}
                />
              </div>
            )}

            {/* Right Column - Assistant */}
            {isAssistantOpen && selectedMode === 'analyze' && (
              <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col min-h-[400px]">
                <MistakesPanel 
                  mistakes={mistakes}
                  inputText={inputText}
                  aiAnalysis={aiAnalysis}
                  assistantResult={assistantResult}
                  isAssistantLoading={isAssistantLoading}
                  onDescribe={handleAssistantDescribe}
                  onKeywords={handleAssistantKeywords}
                  onImprove={handleAssistantImprove}
                  onClose={() => setIsAssistantOpen(false)}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { currentUser } = useAuth();
  const { setTheme, setAccentColor } = useTheme();

  // Load and apply user preferences (theme mode and accent color) upon login
  useEffect(() => {
    if (currentUser) {
      if (currentUser.themeMode) {
        setTheme(currentUser.themeMode);
      }
      if (currentUser.themeAccent) {
        setAccentColor(currentUser.themeAccent);
      }
    }
  }, [currentUser, setTheme, setAccentColor]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest only access routes */}
        <Route element={<ProtectedRoute guestOnly={true} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Authenticated only access routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainAnalyzerApp />} />
        </Route>

        {/* Fallback wildcard router */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;