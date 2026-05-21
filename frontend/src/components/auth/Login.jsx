import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Loader2, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Login = () => {
  const { login, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        showToast('Успішний вхід', 'success');
        navigate('/');
      } else {
        if (res.error === 'Невірний пароль') {
          showToast('Невірний пароль', 'error');
        } else {
          showToast(res.error, 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Щось пішло не так при вході', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-text p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic background blur accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface/60 dark:bg-surface/30 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-soft dark:shadow-soft-dark transform transition-all duration-300 animate-slide-in">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent-600/10 text-accent-600 rounded-xl flex items-center justify-center mb-3">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Вхід в систему</h1>
          <p className="text-sm text-textMuted mt-1">AI Text Analyzer SaaS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-text" htmlFor="password">
                Пароль
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-accent-600 hover:text-accent-500 transition-colors"
              >
                Забули пароль?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={authLoading}
              className="w-4 h-4 border border-border rounded bg-surfaceHover text-accent-600 focus:ring-accent-500 focus:ring-offset-background cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium text-textMuted ml-2 cursor-pointer select-none"
            >
              Запам'ятати мене
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={authLoading}
            className="w-full h-11 flex justify-center text-sm font-semibold shadow-soft"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Вхід...
              </>
            ) : (
              'Увійти'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-textMuted">
            Немає облікового запису?{' '}
            <Link
              to="/register"
              className="font-bold text-accent-600 hover:text-accent-500 transition-colors"
            >
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
