import { Box, Typography, Button, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TranslateIcon from '@mui/icons-material/Translate';

export const SidebarModes = ({ isLoading, disabled, selectedMode, setSelectedMode, onMainAction, isAssistantOpen, setIsAssistantOpen }) => {
  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setSelectedMode(newMode);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: { xs: 'row', sm: 'column' }, 
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderRight: { xs: 'none', md: '1px solid' },
        borderBottom: { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        Режим роботи
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={selectedMode}
        exclusive
        onChange={handleModeChange}
        aria-label="App Mode"
        orientation="vertical"
        fullWidth
        disabled={isLoading}
      >
        <ToggleButton value="analyze" aria-label="analyze mode">
          <AutoFixHighIcon sx={{ mr: 1 }} />
          Перевірка / Аналіз
        </ToggleButton>
        <ToggleButton value="translate" aria-label="translate mode">
          <TranslateIcon sx={{ mr: 1 }} />
          Переклад
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 1 }} />
      
      {selectedMode === 'analyze' && (
        <>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AutoFixHighIcon />} 
            size="large" 
            onClick={onMainAction} 
            disabled={disabled || isLoading}
            fullWidth
          >
            Перевірити
          </Button>

          <Divider sx={{ my: 1 }} />
          <Button 
            variant={isAssistantOpen ? "contained" : "outlined"} 
            color={isAssistantOpen ? "warning" : "secondary"} 
            startIcon={<AutoFixHighIcon />} 
            size="large" 
            onClick={() => setIsAssistantOpen(!isAssistantOpen)} 
            fullWidth
          >
            {isAssistantOpen ? "Асистент: УВІМК" : "Асистент: ВИМК"}
          </Button>
        </>
      )}
    </Box>
  );
};
