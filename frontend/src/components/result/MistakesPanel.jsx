import { useMemo, useState } from 'react';
import { 
  X, TrendingUp, ChevronDown, ChevronRight, FileText, 
  Key, Sparkles, SpellCheck, BrainCircuit, BarChart3, Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';

// Конфігурація категорій помилок
const CATEGORY_CONFIG = {
  'Орфографія':    { color: 'text-red-500', bg: 'bg-red-100', bar: 'bg-red-500' },
  'Пунктуація':    { color: 'text-orange-500', bg: 'bg-orange-100', bar: 'bg-orange-500' },
  'Граматика':     { color: 'text-purple-500', bg: 'bg-purple-100', bar: 'bg-purple-500' },
  'Лексика':       { color: 'text-blue-500', bg: 'bg-blue-100', bar: 'bg-blue-500' },
  'Стилістика':    { color: 'text-teal-500', bg: 'bg-teal-100', bar: 'bg-teal-500' },
  'Повтори слів':  { color: 'text-amber-700', bg: 'bg-amber-100', bar: 'bg-amber-700' },
  'Інше':          { color: 'text-slate-500', bg: 'bg-slate-100', bar: 'bg-slate-500' },
};

// Обчислення статистики тексту
function computeTextStats(text) {
  if (!text || !text.trim()) return null;
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;
  const sentences = text.split(/[.!?…]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgSentenceLen = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\wа-яіїєґ]/gi, ''))).size;
  return { wordCount, charCount, sentenceCount, avgSentenceLen, uniqueWords };
}

// Карточка для AI аналізу
function AIChip({ label, value, colorClass, bgClass }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-textMuted">{label}</span>
      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass} ${bgClass}`}>
        {value || 'Н/Д'}
      </span>
    </div>
  );
}

const Accordion = ({ title, icon, defaultExpanded = true, children, badge }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="border-b border-border last:border-0">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full flex items-center justify-between p-3 hover:bg-surfaceHover transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-text text-sm">{title}</span>
          {badge !== undefined && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {badge}
            </span>
          )}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-textMuted" /> : <ChevronRight className="w-4 h-4 text-textMuted" />}
      </button>
      {expanded && (
        <div className="p-3 pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const MistakesPanel = ({
  mistakes = [],
  inputText = '',
  aiAnalysis = null,
  assistantResult = null,
  isAssistantLoading = false,
  onDescribe,
  onKeywords,
  onImprove,
  onClose,
}) => {

  const mistakesByCategory = useMemo(() => {
    const groups = {};
    mistakes.forEach(m => {
      const cat = m.category || 'Інше';
      groups[cat] = (groups[cat] || 0) + 1;
    });
    return groups;
  }, [mistakes]);

  const textStats = useMemo(() => computeTextStats(inputText), [inputText]);
  const hasText = inputText.trim().length > 0;

  const styleConfig = { 'Офіційний': {c: 'text-blue-700', b: 'bg-blue-100'}, 'Нейтральний': {c: 'text-slate-700', b: 'bg-slate-100'}, 'Розмовний': {c: 'text-orange-700', b: 'bg-orange-100'} };
  const toneConfig  = { 'Позитивний': {c: 'text-green-700', b: 'bg-green-100'}, 'Нейтральний': {c: 'text-slate-700', b: 'bg-slate-100'}, 'Негативний': {c: 'text-red-700', b: 'bg-red-100'} };
  const levelConfig = { A1: {c: 'text-green-600', b: 'bg-green-100'}, A2: {c: 'text-lime-600', b: 'bg-lime-100'}, B1: {c: 'text-amber-500', b: 'bg-amber-100'}, B2: {c: 'text-orange-500', b: 'bg-orange-100'}, C1: {c: 'text-red-500', b: 'bg-red-100'}, C2: {c: 'text-purple-600', b: 'bg-purple-100'} };

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl shadow-soft border border-border overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-accent-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="w-5 h-5" />
          Асистент
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
        {/* Action Buttons */}
        <div className="p-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            startIcon={isAssistantLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            onClick={onDescribe}
            disabled={!hasText || isAssistantLoading}
          >
            Короткий опис
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            startIcon={isAssistantLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            onClick={onKeywords}
            disabled={!hasText || isAssistantLoading}
          >
            Ключові слова
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-green-500 hover:bg-green-600 justify-start border-none"
            startIcon={<Sparkles className="w-4 h-4" />}
            onClick={onImprove}
            disabled={!hasText || isAssistantLoading}
          >
            Покращити текст
          </Button>
        </div>

        {/* Assistant Result */}
        {assistantResult && (
          <div className={`mx-3 mb-2 p-3 rounded-xl border ${assistantResult.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${assistantResult.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
              {assistantResult.type === 'keywords' ? '🔑 Ключові слова' : assistantResult.type === 'describe' ? '📄 Короткий опис' : '⚠️ Помилка'}
            </span>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {assistantResult.text}
            </p>
          </div>
        )}

        <div className="h-px bg-border w-full" />

        {/* Mistakes Section */}
        <Accordion 
          title="Помилки" 
          icon={<SpellCheck className="w-4 h-4 text-red-500" />} 
          badge={mistakes.length}
        >
          {mistakes.length === 0 ? (
            <p className="text-sm text-green-600 text-center py-2">✅ Помилок не знайдено!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(mistakesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Інше'];
                  const pct = Math.round((count / mistakes.length) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className={`font-semibold ${cfg.color}`}>{cat}</span>
                        <span className="text-textMuted font-medium">{count}</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${cfg.bg}`}>
                        <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Accordion>

        {/* Stats Section */}
        <Accordion 
          title="Статистика тексту" 
          icon={<BarChart3 className="w-4 h-4 text-accent-500" />}
        >
          {!textStats ? (
            <p className="text-sm text-textMuted text-center py-2">Введіть текст для аналізу</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Слів', value: textStats.wordCount },
                { label: 'Символів', value: textStats.charCount },
                { label: 'Речень', value: textStats.sentenceCount },
                { label: 'Сер. довж. речення', value: `${textStats.avgSentenceLen} сл.` },
                { label: 'Унік. слів', value: textStats.uniqueWords },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surfaceHover p-2 rounded-xl text-center border border-border">
                  <div className="text-lg font-bold text-accent-600 leading-tight">{value}</div>
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}
        </Accordion>

        {/* AI Analysis Section */}
        <Accordion 
          title="AI Аналіз" 
          icon={<BrainCircuit className="w-4 h-4 text-purple-500" />}
        >
          {!aiAnalysis ? (
            <p className="text-sm text-textMuted text-center py-2">Натисніть «Перевірити» щоб отримати AI аналіз</p>
          ) : (
            <div className="bg-surfaceHover p-3 rounded-xl flex flex-col gap-1 border border-border">
              <AIChip 
                label="Стиль" 
                value={aiAnalysis.style} 
                colorClass={(styleConfig[aiAnalysis.style] || styleConfig['Нейтральний']).c} 
                bgClass={(styleConfig[aiAnalysis.style] || styleConfig['Нейтральний']).b} 
              />
              <div className="h-px bg-border my-1" />
              <AIChip 
                label="Тональність" 
                value={aiAnalysis.tonality} 
                colorClass={(toneConfig[aiAnalysis.tonality] || toneConfig['Нейтральний']).c} 
                bgClass={(toneConfig[aiAnalysis.tonality] || toneConfig['Нейтральний']).b} 
              />
              <div className="h-px bg-border my-1" />
              <AIChip 
                label="Складність" 
                value={aiAnalysis.complexity} 
                colorClass={(levelConfig[aiAnalysis.complexity] || levelConfig.B1).c} 
                bgClass={(levelConfig[aiAnalysis.complexity] || levelConfig.B1).b} 
              />
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
};
