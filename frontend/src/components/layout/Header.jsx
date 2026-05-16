import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MenuIcon from '@mui/icons-material/Menu';

export const Header = ({ onToggleSidebar }) => {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onToggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        <AutoFixHighIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          AI Text Analyzer
        </Typography>
      </Toolbar>
    </AppBar>
  );
};