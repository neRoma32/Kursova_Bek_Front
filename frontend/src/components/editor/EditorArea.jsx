import { Paper, Typography, TextField, Box, Button, Select, MenuItem, FormControl, Popper, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRef, useState } from 'react';

export const EditorArea = ({ text, setText, stats, onClear, isLoading, onFileUploadAction, mistakes = [], applyCorrection }) => {
  const textFieldRef = useRef(null);
  const backdropRef = useRef(null);
  
  const closeTimer = useRef(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMistake, setActiveMistake] = useState(null);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(text + clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleSelectAll = () => {
    if (textFieldRef.current) {
      textFieldRef.current.select();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Помилка читання файлу');
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.pdf')) {
      if (onFileUploadAction) {
        onFileUploadAction(file);
      }
    } else {
      alert('Непідтримуваний формат файлу. Використовуйте .txt, .docx або .pdf');
    }
    
    e.target.value = null;
  };

  const handleScroll = (e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
    }
    handleClosePopover();
  };

  const handleMistakeHover = (event, mistake) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setAnchorEl(event.currentTarget);
    setActiveMistake(mistake);
  };

  const handleMistakeLeave = () => {
    closeTimer.current = setTimeout(() => {
      setAnchorEl(null);
    }, 350); 
  };

  const handlePopoverEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleClosePopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setAnchorEl(null);
  };

  const handleApplySuggestion = (suggestion) => {
    if (activeMistake && applyCorrection) {
      applyCorrection(activeMistake, suggestion);
      handleClosePopover();
    }
  };

  const renderHighlights = () => {
    if (!mistakes || mistakes.length === 0) return text;
    
    const sortedMistakes = [...mistakes].sort((a, b) => a.offset - b.offset);
    const parts = [];
    let lastIndex = 0;
    
    sortedMistakes.forEach((mistake, idx) => {
      if (mistake.offset > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{text.substring(lastIndex, mistake.offset)}</span>);
      }
      
      parts.push(
        <mark 
          key={`mark-${idx}`}
          onMouseEnter={(e) => handleMistakeHover(e, mistake)}
          onMouseLeave={handleMistakeLeave}
          onClick={() => {
            if (textFieldRef.current) {
              textFieldRef.current.focus();
              textFieldRef.current.setSelectionRange(mistake.offset, mistake.offset);
            }
          }}
          style={{
            backgroundColor: 'transparent',
            color: 'transparent',
            borderBottom: '2px solid #ff4d4f', 
            pointerEvents: 'auto', 
            cursor: 'pointer',
            paddingBottom: '2px'
          }}
        >
          {text.substring(mistake.offset, mistake.offset + mistake.length)}
        </mark>
      );
      
      lastIndex = mistake.offset + mistake.length;
    });
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" color="primary">Вхідний текст</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value="auto" disabled>
            <MenuItem value="auto">Автовизначення</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative', flexGrow: 1, minHeight: '350px' }}>
        <TextField
          inputRef={textFieldRef}
          multiline
          placeholder="Введіть текст..."
          variant="outlined"
          fullWidth
          sx={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', background: 'transparent' },
            '& .MuiInputBase-input': { 
                zIndex: 1, 
                lineHeight: '1.5'
            }
          }}
          inputProps={{ onScroll: handleScroll }}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleClosePopover();
          }}
        />
        
        <Box 
          ref={backdropRef}
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            padding: '16.5px 14px', 
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: '1rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: 'transparent',
            pointerEvents: 'none', 
            overflowY: 'auto',
            zIndex: 2,
            boxSizing: 'border-box',
            '&::-webkit-scrollbar': { display: 'none' }, 
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {renderHighlights()}
        </Box>
      </Box>

      {/* Замінили Popover на Popper для ідеальної роботи ховера та кліків */}
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }} // Гарантує, що меню поверх усього іншого
        onMouseEnter={handlePopoverEnter}
        onMouseLeave={handleMistakeLeave}
      >
        <Paper
          elevation={4}
          sx={{ 
            p: '12px 16px', 
            minWidth: 220,
            borderRadius: '8px', 
            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)', // Трохи глибша тінь для краси
            border: '1px solid #e0e0e0',
            mt: 0.5 
          }}
        >
          {activeMistake && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography sx={{ color: '#5f6368', fontSize: '0.85rem' }}>
                  Correct the mistake
                </Typography>
                <Chip 
                  label="BETA" 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem', 
                    bgcolor: '#e8f0fe', 
                    color: '#1a73e8', 
                    fontWeight: 'bold',
                    borderRadius: '4px'
                  }} 
                />
              </Box>
              
              {activeMistake.suggestions && activeMistake.suggestions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                  {activeMistake.suggestions.map((suggestion, idx) => (
                    <Box 
                      key={idx} 
                      onClick={() => handleApplySuggestion(suggestion)}
                      sx={{ 
                        color: '#1a73e8', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: '#f1f3f4' } 
                      }}
                    >
                      {suggestion}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ mb: 1, p: 1, bgcolor: '#f8f9fa', borderRadius: '6px', border: '1px dashed #dadce0' }}>
                  <Typography variant="body2" color="text.primary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    {activeMistake.message || 'Помилка без варіантів виправлення'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ✍️ Клікніть на слово в тексті, щоб відредагувати його вручну.
                  </Typography>
                </Box>
              )}

              <Button 
                size="small" 
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={handleClosePopover}
                disableRipple
                sx={{ 
                  color: '#5f6368', 
                  justifyContent: 'flex-start', 
                  p: '6px 4px', 
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'transparent', color: '#202124' } 
                }}
              >
                Dismiss
              </Button>
            </Box>
          )}
        </Paper>
      </Popper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">{stats}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" component="label" disabled={isLoading}>
            Файл
            <input type="file" hidden accept=".txt,.docx,.pdf" onChange={handleFileUpload} />
          </Button>
          <Button size="small" variant="outlined" onClick={handlePaste} disabled={isLoading}>
            Вставити
          </Button>
          <Button size="small" variant="outlined" onClick={handleSelectAll} disabled={!text}>
            Виділити все
          </Button>
          <Button size="small" variant="outlined" onClick={handleCopy} disabled={!text}>
            Копіювати
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={onClear} disabled={isLoading || !text}>
            Очистити
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};