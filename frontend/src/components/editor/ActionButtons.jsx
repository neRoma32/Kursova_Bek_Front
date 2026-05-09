import { Button, Divider, Box } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TranslateIcon from '@mui/icons-material/Translate';
import CompressIcon from '@mui/icons-material/Compress';
import ExpandIcon from '@mui/icons-material/Expand';
import { api } from '../../services/api';

export const ActionButtons = ({ isLoading, disabled, onCheck, onAction }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', height: '100%' }}>
      <Button variant="contained" color="primary" startIcon={<AutoFixHighIcon />} size="large" onClick={onCheck} disabled={disabled || isLoading}>
        Перевірити
      </Button>
      <Button variant="contained" color="secondary" startIcon={<TranslateIcon />} size="large" onClick={() => onAction(api.translate)} disabled={disabled || isLoading}>
        Перекласти (EN)
      </Button>
      <Divider sx={{ my: 1 }}>АБО</Divider>
      <Button variant="outlined" startIcon={<CompressIcon />} onClick={() => onAction(api.summarize)} disabled={disabled || isLoading}>
        Скоротити
      </Button>
      <Button variant="outlined" startIcon={<ExpandIcon />} onClick={() => onAction(api.expand)} disabled={disabled || isLoading}>
        Розширити
      </Button>
      <Button variant="outlined" startIcon={<AutoFixHighIcon />} onClick={() => onAction(api.rewrite)} disabled={disabled || isLoading}>
        Перефразувати
      </Button>
    </Box>
  );
};