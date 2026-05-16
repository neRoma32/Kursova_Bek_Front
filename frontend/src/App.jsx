import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { Header } from './components/layout/Header';
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
    handleCheck,
    handleAction,
    handleFileUploadAction,
    isTranslationMode,
    setIsTranslationMode,
    outputLang,
    setOutputLang,
    mistakes,
    isAssistantOpen,
    setIsAssistantOpen,
    applyCorrection
  } = useTextAnalyzer();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Бокова панель */}
        {isSidebarOpen && (
          <Box sx={{ width: '280px', flexShrink: 0, overflowY: 'auto' }}>
            <Sidebar 
              isLoading={isLoading}
              disabled={!inputText}
              onCheck={handleCheck}
              onAction={handleAction}
              isTranslationMode={isTranslationMode}
              setIsTranslationMode={setIsTranslationMode}
              isAssistantOpen={isAssistantOpen}
              setIsAssistantOpen={setIsAssistantOpen}
            />
          </Box>
        )}

      {/* Основна частина */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
        <Typography variant="h4" color="warning.main" gutterBottom sx={{ fontWeight: 'bold' }}>
          Аналізатор тексту
        </Typography>

        <Box sx={{ flexGrow: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 4, height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Ліва колонка - Вхідний текст */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <EditorArea
                text={inputText}
                setText={setInputText}
                stats={getStats(inputText)}
                onClear={handleClear}
                isLoading={isLoading}
                onFileUploadAction={handleFileUploadAction}
                mistakes={mistakes}
                applyCorrection={applyCorrection}
              />
            </Box>

            {/* Права колонка - Результат */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <ResultArea
                text={outputText}
                setText={setOutputText}
                stats={getStats(outputText)}
                isLoading={isLoading}
                outputLang={outputLang}
                setOutputLang={setOutputLang}
              />
            </Box>

            {/* Третя колонка - Асистент (Панель помилок) */}
            {isAssistantOpen && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: { md: '300px' } }}>
                <MistakesPanel 
                  mistakes={mistakes} 
                  applyCorrection={applyCorrection}
                  onClose={() => setIsAssistantOpen(false)}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}

export default App;