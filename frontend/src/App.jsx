import { useState } from 'react';
import { HeaderTopBar } from './components/layout/HeaderTopBar';
import { Sidebar } from './components/layout/Sidebar';
import { EditorArea } from './components/editor/EditorArea';
import { ResultArea } from './components/result/ResultArea';
import { MistakesPanel } from './components/result/MistakesPanel';
import { useTextAnalyzer } from './hooks/useTextAnalyzer';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  } = useTextAnalyzer();

  return (
    <div className="h-screen w-full flex flex-col bg-background text-text overflow-hidden">
      <HeaderTopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} md:relative absolute z-20 h-full flex-shrink-0`}>
          <div className="w-64 h-full">
            <Sidebar 
              isLoading={isLoading}
              disabled={!inputText}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              onMainAction={handleMainAction}
              isAssistantOpen={isAssistantOpen}
              setIsAssistantOpen={setIsAssistantOpen}
              history={history}
              onDeleteHistoryItem={deleteHistoryItem}
              onClearHistory={clearHistory}
              onLoadHistoryItem={loadFromHistory}
            />
          </div>
        </div>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-10 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

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
              />
            </div>

            {/* Middle Column - Result */}
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

            {/* Right Column - Assistant */}
            {isAssistantOpen && selectedMode === 'analyze' && (
              <div className="w-full lg:w-80 flex-shrink-0 flex flex-col min-h-[400px]">
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

export default App;