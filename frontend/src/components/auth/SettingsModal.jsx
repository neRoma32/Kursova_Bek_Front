import { useTheme } from '../../context/ThemeContext';
import { X, Settings, Moon, Sun, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, accentColor, changeAccent } = useTheme();

  if (!isOpen) return null;

  const colors = [
    { name: 'blue', label: 'Синій', class: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'purple', label: 'Фіолетовий', class: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'orange', label: 'Помаранчевий', class: 'bg-orange-500 hover:bg-orange-600' },
    { name: 'green', label: 'Зелений', class: 'bg-green-500 hover:bg-green-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl transform transition-all duration-300 animate-slide-in text-text">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-600 animate-spin-slow" />
            Налаштування
          </h2>
          <button 
            onClick={onClose} 
            className="text-textMuted hover:text-text p-1 rounded-lg hover:bg-surfaceHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Theme Mode Toggle */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text">Колірна схема</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'border-accent-600 bg-accent-50 text-accent-600 ring-1 ring-accent-600'
                    : 'border-border bg-surfaceHover text-textMuted hover:text-text'
                }`}
              >
                <Sun className="w-4 h-4" />
                Світла
              </button>
              <button
                type="button"
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-accent-600 bg-accent-50/20 text-accent-400 ring-1 ring-accent-600'
                    : 'border-border bg-surfaceHover text-textMuted hover:text-text'
                }`}
              >
                <Moon className="w-4 h-4" />
                Темна
              </button>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text">Акцентний колір</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => changeAccent(c.name)}
                  className={`flex items-center justify-between px-4 h-11 rounded-xl border text-sm font-medium transition-all ${
                    accentColor === c.name
                      ? 'border-accent-600 bg-accent-50 dark:bg-accent-50/20 text-accent-600 dark:text-accent-400'
                      : 'border-border bg-surfaceHover text-text hover:border-textMuted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${c.class}`} />
                    {c.label}
                  </div>
                  {accentColor === c.name && <Check className="w-4 h-4 text-accent-600 dark:text-accent-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-5 border-t border-border mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="h-10 text-sm px-6 font-semibold"
          >
            Готово
          </Button>
        </div>

      </div>
    </div>
  );
};
