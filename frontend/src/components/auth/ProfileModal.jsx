import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, User, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, authLoading } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || 'bg-gradient-to-tr from-blue-500 to-indigo-600');

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const gradients = [
    { id: 'blue', class: 'bg-gradient-to-tr from-blue-500 to-indigo-600' },
    { id: 'purple', class: 'bg-gradient-to-tr from-purple-500 to-pink-600' },
    { id: 'orange', class: 'bg-gradient-to-tr from-orange-400 to-amber-600' },
    { id: 'green', class: 'bg-gradient-to-tr from-green-400 to-emerald-600' },
    { id: 'rose', class: 'bg-gradient-to-tr from-rose-500 to-red-600' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Ім’я користувача є обов’язковим';
    }

    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Для зміни пароля потрібно вказати поточний пароль';
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Новий пароль має містити щонайменше 6 символів';
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Нові паролі не збігаються';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await updateProfile({
        username,
        currentPassword: newPassword ? currentPassword : '',
        newPassword: newPassword ? newPassword : '',
        avatarUrl,
      });

      if (res.success) {
        showToast('Профіль успішно оновлено', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        onClose();
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Помилка під час оновлення профілю', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl transform transition-all duration-300 animate-slide-in text-text">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-accent-600" />
            Редагувати профіль
          </h2>
          <button 
            onClick={onClose} 
            className="text-textMuted hover:text-text p-1 rounded-lg hover:bg-surfaceHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">Аватар профілю</label>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow ${avatarUrl}`}>
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex gap-2">
                {gradients.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAvatarUrl(g.class)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 border ${g.class} ${
                      avatarUrl === g.class ? 'ring-2 ring-accent-600 ring-offset-2 dark:ring-offset-surface' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text" htmlFor="profile-username">
              Ім'я користувача
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={authLoading}
                className="w-full h-10 pl-9 pr-4 bg-surfaceHover border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 transition-all"
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 mt-0.5">{errors.username}</p>
            )}
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Зміна пароля (опціонально)
            </h3>
            
            <div className="space-y-3">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text" htmlFor="current-pass">
                  Поточний пароль
                </label>
                <input
                  id="current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: '' }));
                  }}
                  disabled={authLoading}
                  placeholder="Введіть поточний пароль"
                  className={`w-full h-10 px-3 bg-surfaceHover border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 transition-all ${
                    errors.currentPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                  }`}
                />
                {errors.currentPassword && (
                  <p className="text-[11px] text-red-500">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text" htmlFor="new-pass">
                  Новий пароль
                </label>
                <input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  disabled={authLoading}
                  placeholder="Мінімум 6 символів"
                  className={`w-full h-10 px-3 bg-surfaceHover border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 transition-all ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-[11px] text-red-500">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text" htmlFor="confirm-new-pass">
                  Підтвердіть новий пароль
                </label>
                <input
                  id="confirm-new-pass"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (errors.confirmNewPassword) setErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
                  }}
                  disabled={authLoading}
                  placeholder="Повторіть новий пароль"
                  className={`w-full h-10 px-3 bg-surfaceHover border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 transition-all ${
                    errors.confirmNewPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                  }`}
                />
                {errors.confirmNewPassword && (
                  <p className="text-[11px] text-red-500">{errors.confirmNewPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={authLoading}
              className="h-10 text-sm"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={authLoading}
              className="h-10 text-sm flex items-center"
              startIcon={!authLoading && <Sparkles className="w-4 h-4" />}
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Збереження...
                </>
              ) : (
                'Зберегти зміни'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
