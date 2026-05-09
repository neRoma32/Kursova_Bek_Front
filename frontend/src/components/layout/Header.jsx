import { AppBar, Toolbar, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <AutoFixHighIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          AI Text Analyzer
        </Typography>
      </Toolbar>
    </AppBar>
  );
};