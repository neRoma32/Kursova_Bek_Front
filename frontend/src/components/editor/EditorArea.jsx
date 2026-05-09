import { Paper, Typography, TextField, Box, Button } from '@mui/material';

export const EditorArea = ({ text, setText, stats, onClear, isLoading }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom color="primary">Вхідний текст</Typography>
      <TextField
        multiline
        rows={18}
        placeholder="Введіть текст..."
        variant="outlined"
        fullWidth
        sx={{ flexGrow: 1 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">{stats}</Typography>
        <Button size="small" color="error" onClick={onClear} disabled={isLoading || !text}>
          Очистити
        </Button>
      </Box>
    </Paper>
  );
};