import { Paper, Typography, TextField, Box, Button, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const ResultArea = ({ text, stats, isLoading }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert('Текст скопійовано!');
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', position: 'relative' }}>
      <Typography variant="h6" gutterBottom color="success.main">Результат обробки</Typography>
      {isLoading && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <CircularProgress />
        </Box>
      )}
      <TextField
        multiline
        rows={18}
        placeholder="Тут з'явиться результат..."
        variant="outlined"
        fullWidth
        InputProps={{ readOnly: true }}
        sx={{ flexGrow: 1, opacity: isLoading ? 0.5 : 1 }}
        value={text}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">{stats}</Typography>
        <Button size="small" startIcon={<ContentCopyIcon />} color="success" onClick={handleCopy} disabled={!text}>
          Копіювати
        </Button>
      </Box>
    </Paper>
  );
};