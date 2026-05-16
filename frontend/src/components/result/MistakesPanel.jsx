import { Box, Paper, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ErrorIcon from '@mui/icons-material/Error';

export const MistakesPanel = ({ mistakes, onClose }) => {
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoGraphIcon />
          Статистика
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <ErrorIcon color={mistakes.length > 0 ? "error" : "success"} sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h3" color={mistakes.length > 0 ? "error.main" : "success.main"} fontWeight="bold">
            {mistakes.length}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Знайдено помилок
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Що перевіряється:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Орфографія</li>
            <li>Пунктуація</li>
            <li>Лексичні помилки</li>
            <li>Граматика</li>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
