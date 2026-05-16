import { Box, Typography, Button, Divider } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TranslateIcon from '@mui/icons-material/Translate';
import CompressIcon from '@mui/icons-material/Compress';
import ExpandIcon from '@mui/icons-material/Expand';
import { api } from '../../services/api';

export const Sidebar = ({ isLoading, disabled, onCheck, onAction, isTranslationMode, setIsTranslationMode, isAssistantOpen, setIsAssistantOpen }) => {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        p: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        Інші можливі функції
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AutoFixHighIcon />} 
        size="large" 
        onClick={onCheck} 
        disabled={disabled || isLoading}
        fullWidth
      >
        Перевірити
      </Button>
      
      <Button 
        variant={isTranslationMode ? "contained" : "outlined"} 
        color={isTranslationMode ? "success" : "secondary"} 
        startIcon={<TranslateIcon />} 
        size="large" 
        onClick={() => setIsTranslationMode(!isTranslationMode)} 
        fullWidth
      >
        {isTranslationMode ? "Авто-переклад: УВІМК" : "Авто-переклад: ВИМК"}
      </Button>
      
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

      <Divider sx={{ my: 1 }} />
      
      <Button 
        variant="outlined" 
        startIcon={<CompressIcon />} 
        onClick={() => onAction(api.summarize)} 
        disabled={disabled || isLoading}
        fullWidth
      >
        Скоротити
      </Button>
      
      <Button 
        variant="outlined" 
        startIcon={<ExpandIcon />} 
        onClick={() => onAction(api.expand)} 
        disabled={disabled || isLoading}
        fullWidth
      >
        Розширити
      </Button>
      
      <Button 
        variant="outlined" 
        startIcon={<AutoFixHighIcon />} 
        onClick={() => onAction(api.rewrite)} 
        disabled={disabled || isLoading}
        fullWidth
      >
        Перефразувати
      </Button>
    </Box>
  );
};
