import { Box, Grid } from '@mui/material';
import { Header } from './components/layout/Header';
import { EditorArea } from './components/editor/EditorArea';
import { ActionButtons } from './components/editor/ActionButtons';
import { ResultArea } from './components/result/ResultArea';
import { useTextAnalyzer } from './hooks/useTextAnalyzer';

function App() {
  const {
    inputText,
    setInputText,
    outputText,
    isLoading,
    getStats,
    handleClear,
    handleCheck,
    handleAction
  } = useTextAnalyzer();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Box
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={4.5} sx={{ display: 'flex', flexDirection: 'column' }}>
              <EditorArea
                text={inputText}
                setText={setInputText}
                stats={getStats(inputText)}
                onClear={handleClear}
                isLoading={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <ActionButtons
                isLoading={isLoading}
                disabled={!inputText}
                onCheck={handleCheck}
                onAction={handleAction}
              />
            </Grid>

            <Grid item xs={12} md={4.5} sx={{ display: 'flex', flexDirection: 'column' }}>
              <ResultArea
                text={outputText}
                stats={getStats(outputText)}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default App;