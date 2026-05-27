import { Menu, Moon, Sun, Wand2, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState, useRef, useEffect } from 'react';
import { ProfileModal } from '../auth/ProfileModal';
import { SettingsModal } from '../auth/SettingsModal';

export const HeaderTopBar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme, accentColor, changeAccent } = useTheme();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();

  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const userMenuRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Ви вийшли з системи', 'info');
  };

  // Get active avatar class or default
  const avatarClass = currentUser?.avatarUrl || 'bg-gradient-to-tr from-blue-500 to-indigo-600';
  const initial = currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-surface border-b border-border transition-colors duration-300 relative z-50">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 text-accent-600">
          <Wand2 className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-xl tracking-tight hidden sm:block text-text">
            AI Text Analyzer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">


        {/* Light/Dark theme selector */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Змінити тему">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-border mx-1" />

        {/* User Profile dropdown */}
        {currentUser && (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surfaceHover transition-colors text-left"
            >
              {/* Stylized Avatar bubble */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${avatarClass}`}>
                {initial}
              </div>
              <span className="text-sm font-medium text-text hidden sm:inline max-w-[120px] truncate">
                {currentUser.username}
              </span>
              <ChevronDown className="w-4 h-4 text-textMuted hidden sm:inline" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-50 animate-slide-in text-text">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-xs text-textMuted truncate">Увійшов як</p>
                  <p className="text-sm font-bold truncate">{currentUser.username}</p>
                  <p className="text-[10px] text-textMuted truncate">{currentUser.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surfaceHover text-left transition-colors"
                >
                  <User className="w-4 h-4 text-textMuted" />
                  Мій профіль
                </button>

                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surfaceHover text-left transition-colors"
                >
                  <Settings className="w-4 h-4 text-textMuted" />
                  Налаштування
                </button>

                <div className="border-t border-border my-1" />

                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Вийти
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
