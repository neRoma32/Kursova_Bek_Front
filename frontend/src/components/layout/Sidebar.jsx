import { Wand2, Languages, Sparkles, Bot, History, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Sidebar = ({ 
  isLoading, 
  disabled, 
  selectedMode, 
  setSelectedMode, 
  onMainAction, 
  isAssistantOpen, 
  setIsAssistantOpen,
  history = [],
  onDeleteHistoryItem,
  onClearHistory,
  onLoadHistoryItem
}) => {
  const visibleHistory = history.filter(item => item.mode === selectedMode);

  return (
    <aside className="h-full w-full md:w-64 bg-surface border-r border-border flex flex-col p-4 transition-colors duration-300">
      <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4 px-2">
        Режими роботи
      </h2>
      
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => setSelectedMode('analyze')}
          disabled={isLoading}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
            selectedMode === 'analyze'
              ? 'bg-accent-50 text-accent-600 font-medium'
              : 'text-text hover:bg-surfaceHover'
          }`}
        >
          <Wand2 className="w-5 h-5" />
          <span>Перевірка / Аналіз</span>
        </button>

        <button
          onClick={() => setSelectedMode('translate')}
          disabled={isLoading}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
            selectedMode === 'translate'
              ? 'bg-accent-50 text-accent-600 font-medium'
              : 'text-text hover:bg-surfaceHover'
          }`}
        >
          <Languages className="w-5 h-5" />
          <span>Переклад</span>
        </button>
      </div>

      <div className="mt-6 mb-2 flex justify-between items-center px-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4" />
          Історія
        </h2>
        {visibleHistory.length > 0 && (
          <button 
            onClick={() => {
              // Only clear history for the currently selected mode
              visibleHistory.forEach(item => onDeleteHistoryItem(item.id));
            }}
            className="text-textMuted hover:text-red-500 transition-colors p-1"
            title="Очистити історію"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col gap-1 mb-4">
        {visibleHistory.length === 0 ? (
          <p className="text-xs text-textMuted px-2 italic">Історія порожня</p>
        ) : (
          visibleHistory.map(item => (
            <div 
              key={item.id}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-surfaceHover transition-colors cursor-pointer"
              onClick={() => onLoadHistoryItem(item)}
            >
              <div className="flex flex-col overflow-hidden pr-2">
                <span className="text-xs font-medium text-text truncate">
                  {item.inputText.substring(0, 25)}{item.inputText.length > 25 ? '...' : ''}
                </span>
                <span className="text-[10px] text-textMuted">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.actionLabel || (item.mode === 'analyze' ? 'Аналіз' : 'Переклад')}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHistoryItem(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-textMuted hover:text-red-500 hover:bg-red-50 rounded transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3 flex-shrink-0 pt-2 border-t border-border">
        {selectedMode === 'analyze' && (
          <>
            <Button
              variant="primary"
              size="lg"
              disabled={disabled || isLoading}
              onClick={onMainAction}
              startIcon={<Sparkles className="w-5 h-5" />}
              className="w-full shadow-soft"
            >
              Перевірити текст
            </Button>
            
            <Button
              variant={isAssistantOpen ? "secondary" : "outline"}
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              startIcon={<Bot className="w-5 h-5" />}
              className="w-full"
            >
              {isAssistantOpen ? "Асистент: УВІМК" : "Асистент: ВИМК"}
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};
