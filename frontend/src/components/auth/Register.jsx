import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Register = () => {
  const { register, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.trim()) {
      newErrors.username = 'Ім’я користувача є обов’язковим';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Ім’я користувача має містити щонайменше 3 символи';
    }

    if (!email) {
      newErrors.email = 'Електронна пошта є обов’язковою';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Введіть коректну електронну адресу';
    }

    if (!password) {
      newErrors.password = 'Пароль є обов’язковим';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль має містити щонайменше 6 символів';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не збігаються';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await register(username, email, password);
      if (res.success) {
        showToast('Акаунт створено', 'success');
        navigate('/login');
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Помилка під час реєстрації', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-text p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic background blur accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface/60 dark:bg-surface/30 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-soft dark:shadow-soft-dark transform transition-all duration-300 animate-slide-in">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-accent-600/10 text-accent-600 rounded-xl flex items-center justify-center mb-3">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Реєстрація</h1>
          <p className="text-sm text-textMuted mt-1">Створіть акаунт у системі</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username input field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text" htmlFor="username">
              Ім'я користувача
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="username"
                type="text"
                placeholder="Іван Іванов"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                }}
                disabled={authLoading}
                className={`w-full h-11 pl-10 pr-4 bg-surfaceHover border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 ${
                  errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.username}</p>
            )}
          </div>

          {/* Email input field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text" htmlFor="email">
              Електронна пошта
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="email"
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                disabled={authLoading}
                className={`w-full h-11 pl-10 pr-4 bg-surfaceHover border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 ${
                  errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.email}</p>
            )}
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text" htmlFor="password">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Мінімум 6 символів"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                disabled={authLoading}
                className={`w-full h-11 pl-10 pr-11 bg-surfaceHover border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 ${
                  errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text p-1 rounded transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password input field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text" htmlFor="confirmPassword">
              Підтвердження пароля
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Повторіть пароль"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                disabled={authLoading}
                className={`w-full h-11 pl-10 pr-11 bg-surfaceHover border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={authLoading}
            className="w-full h-11 flex justify-center text-sm font-semibold shadow-soft mt-2"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Створення...
              </>
            ) : (
              'Зареєструватися'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-textMuted">
            Вже є акаунт?{' '}
            <Link
              to="/login"
              className="font-bold text-accent-600 hover:text-accent-500 transition-colors"
            >
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
