import { useRef, useState, useEffect } from 'react';
import { Trash2, Copy, FileText, Download, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button';

export const EditorArea = ({ text, setText, stats, onClear, isLoading, onFileUploadAction, mistakes = [], applyCorrection, dismissMistake }) => {
  const textFieldRef = useRef(null);
  const backdropRef = useRef(null);
  const closeTimer = useRef(null);

  const [popoverState, setPopoverState] = useState({ open: false, top: 0, left: 0 });
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
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverState({
      open: true,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setActiveMistake(mistake);
  };

  const handleMistakeLeave = () => {
    closeTimer.current = setTimeout(() => {
      setPopoverState({ ...popoverState, open: false });
    }, 350);
  };

  const handlePopoverEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleClosePopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPopoverState({ ...popoverState, open: false });
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
          className="bg-transparent text-transparent border-b-2 border-red-500 pb-[2px] cursor-pointer pointer-events-auto transition-colors hover:bg-red-500/10"
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
    <div className="flex flex-col h-full bg-surface rounded-2xl shadow-soft border border-border p-4 transition-colors duration-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-text">Вхідний текст</h3>
        <select disabled className="bg-surfaceHover border border-border rounded-lg px-3 py-1 text-sm text-textMuted outline-none appearance-none">
          <option>Автовизначення</option>
        </select>
      </div>

      <div className="relative flex-grow min-h-[350px] bg-surface rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-transparent transition-all">
        {/* Textarea */}
        <textarea
          ref={textFieldRef}
          className="absolute inset-0 w-full h-full p-4 font-sans text-base leading-relaxed whitespace-pre-wrap break-words bg-transparent text-text resize-none outline-none overflow-y-auto z-0"
          placeholder="Введіть текст..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleClosePopover();
          }}
          onScroll={handleScroll}
        />

        {/* Backdrop for highlights (Must be IN FRONT of textarea to catch hover events) */}
        <div
          ref={backdropRef}
          className="absolute inset-0 p-4 font-sans text-base leading-relaxed whitespace-pre-wrap break-words text-transparent pointer-events-none overflow-y-auto no-scrollbar z-10"
        >
          {renderHighlights()}
        </div>
      </div>

      {/* Mistake Popover */}
      {popoverState.open && activeMistake && (
        <div
          className="fixed z-[1300] bg-surface border border-border rounded-xl shadow-soft-dark p-3 min-w-[220px]"
          style={{ top: popoverState.top + 8, left: popoverState.left }}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handleMistakeLeave}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-textMuted font-medium">Виправлення</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-100 text-accent-600">BETA</span>
            </div>

            {activeMistake.suggestions && activeMistake.suggestions.length > 0 ? (
              <div className="flex flex-col gap-1">
                {activeMistake.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="text-left px-2 py-1.5 rounded-lg text-accent-600 font-semibold hover:bg-surfaceHover transition-colors"
                  >
                    {suggestion === "" ? (
                      <span className="text-red-500 italic text-sm font-normal">[Видалити зайве]</span>
                    ) : suggestion === " " ? (
                      <span className="text-orange-500 italic text-sm font-normal">[Замінити на пробіл]</span>
                    ) : (
                      suggestion
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-surfaceHover rounded-lg p-2 border border-border border-dashed">
                <p className="text-sm font-medium text-text mb-1">{activeMistake.message || 'Без варіантів'}</p>
                <p className="text-xs text-textMuted">✍️ Відредагуйте вручну.</p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (dismissMistake && activeMistake) dismissMistake(activeMistake.offset);
                handleClosePopover();
              }}
              startIcon={<Trash2 className="w-4 h-4" />}
              className="mt-1 w-full justify-start text-textMuted"
            >
              Ігнорувати
            </Button>
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
        <span className="text-xs font-medium text-textMuted">{stats}</span>
        
        <div className="flex flex-wrap items-center gap-2">
          <input id="hidden-file-input" type="file" hidden accept=".txt,.docx,.pdf" onChange={handleFileUpload} disabled={isLoading} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('hidden-file-input').click()} 
            disabled={isLoading} 
            startIcon={<FileText className="w-4 h-4" />}
          >
            Файл
          </Button>
          <Button variant="outline" size="sm" onClick={handlePaste} disabled={isLoading}>Вставити</Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={!text}>Виділити</Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text} startIcon={<Copy className="w-4 h-4" />}>Копіювати</Button>
          <Button variant="danger" size="sm" onClick={onClear} disabled={isLoading || !text} startIcon={<Trash2 className="w-4 h-4" />}>Очистити</Button>
        </div>
      </div>
    </div>
  );
};