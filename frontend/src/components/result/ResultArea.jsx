import { Paper, Typography, TextField, Box, Button, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { useRef, useState } from 'react';
import { api } from '../../services/api';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

export const ResultArea = ({ text, setText, stats, isLoading, outputLang, setOutputLang }) => {
  const textFieldRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSelectAll = () => {
    if (textFieldRef.current) {
      textFieldRef.current.select();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    if (setText) setText('');
  };

  const downloadFile = async (type) => {
    if (!text) return;
    setIsDownloading(true);
    try {
      let blob;
      let filename;
      if (type === 'pdf') {
        blob = await api.getReportPdf(text);
        filename = 'AI_Report.pdf';
      } else {
        blob = await api.getReportWord(text);
        filename = 'AI_Report.docx';
      }
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Помилка завантаження ${type} звіту`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" color="success.main">Результат</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select 
            value={outputLang} 
            onChange={(e) => setOutputLang(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="uk">Українська</MenuItem>
            <MenuItem value="de">Deutsch</MenuItem>
            <MenuItem value="fr">Français</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <CircularProgress />
        </Box>
      )}

      <TextField
        inputRef={textFieldRef}
        multiline
        rows={15}
        placeholder="Тут з'явиться результат..."
        variant="outlined"
        fullWidth
        sx={{ flexGrow: 1, opacity: isLoading ? 0.5 : 1 }}
        value={text}
        onChange={(e) => setText ? setText(e.target.value) : null}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">{stats}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" color="primary" onClick={() => downloadFile('pdf')} disabled={isDownloading || !text} startIcon={<PictureAsPdfIcon />}>
            PDF
          </Button>
          <Button size="small" variant="outlined" color="info" onClick={() => downloadFile('word')} disabled={isDownloading || !text} startIcon={<DescriptionIcon />}>
            Word
          </Button>
          <Button size="small" variant="outlined" onClick={handleSelectAll} disabled={!text}>
            Виділити все
          </Button>
          <Button size="small" variant="outlined" onClick={handleCopy} disabled={!text}>
            Копіювати
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={handleClear} disabled={isLoading || !text}>
            Очистити
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};