import { useRef, useState } from 'react';
import { api } from '../../services/api';
import { Copy, Download, FileText, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ResultActionsPanel } from './ResultActionsPanel';

export const ResultArea = ({ text, setText, stats, isLoading, outputLang, setOutputLang, selectedMode, onAction }) => {
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
    <div className="flex flex-col h-full bg-surface rounded-2xl shadow-soft border border-border p-4 transition-colors duration-300 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-green-500">Результат</h3>
        <select 
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text outline-none focus:ring-2 focus:ring-accent-500 transition-all cursor-pointer"
          value={outputLang} 
          onChange={(e) => setOutputLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="uk">Українська</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className={`relative flex-grow min-h-[350px] bg-surfaceHover rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-transparent transition-all ${isLoading ? 'opacity-50' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          </div>
        )}
        
        <textarea
          ref={textFieldRef}
          className="absolute inset-0 w-full h-full p-4 font-sans text-base leading-relaxed bg-transparent text-text resize-none outline-none overflow-y-auto z-10"
          placeholder="Тут з'явиться результат..."
          value={text}
          onChange={(e) => setText ? setText(e.target.value) : null}
          disabled={isLoading}
        />
      </div>

      <ResultActionsPanel 
        isLoading={isLoading}
        disabled={!text}
        onAction={onAction}
      />

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
        <span className="text-xs font-medium text-textMuted">{stats}</span>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadFile('pdf')} 
            disabled={isDownloading || !text} 
            startIcon={<FileText className="w-4 h-4 text-red-500" />}
          >
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadFile('word')} 
            disabled={isDownloading || !text} 
            startIcon={<FileText className="w-4 h-4 text-blue-500" />}
          >
            Word
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={!text}>
            Виділити
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text} startIcon={<Copy className="w-4 h-4" />}>
            Копіювати
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear} disabled={isLoading || !text} startIcon={<Trash2 className="w-4 h-4" />}>
            Очистити
          </Button>
        </div>
      </div>
    </div>
  );
};