import { Menu, Moon, Sun, Palette, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export const HeaderTopBar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme, accentColor, changeAccent } = useTheme();
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef(null);

  const colors = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'green', class: 'bg-green-500' },
  ];

  // Close palette on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setShowPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-surface border-b border-border transition-colors duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 text-accent-600">
          <Wand2 className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight hidden sm:block text-text">
            AI Text Analyzer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <div ref={paletteRef} className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowPalette(!showPalette)}>
            <Palette className="w-5 h-5" />
          </Button>

          {showPalette && (
            <div className="absolute right-0 mt-2 p-2 bg-surface border border-border rounded-xl shadow-soft-dark flex gap-2 z-50">
              {colors.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    changeAccent(c.name);
                    setShowPalette(false);
                  }}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.class} ${accentColor === c.name ? 'ring-2 ring-offset-2 ring-offset-surface ring-text' : ''}`}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
};
