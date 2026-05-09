import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Імпортуємо інструменти для теми
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline скидає стандартні відступи браузера і застосовує колір фону з нашої теми */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)