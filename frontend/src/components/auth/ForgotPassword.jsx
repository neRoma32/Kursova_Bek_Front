import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Електронна пошта є обов’язковою');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Введіть коректну електронну адресу');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Artificial mock delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSent(true);
    showToast('Інструкції для скидання надіслано', 'success');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-text p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic background blur accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface/60 dark:bg-surface/30 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-soft dark:shadow-soft-dark transform transition-all duration-300 animate-slide-in">
        
        {/* App Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-accent-600/10 text-accent-600 rounded-xl flex items-center justify-center mb-3">
            <Wand2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Відновлення пароля</h1>
        </div>

        {!isSent ? (
          <>
            <p className="text-sm text-textMuted text-center mb-6">
              Введіть свою електронну пошту, і ми надішлемо вам інструкції для скидання пароля.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
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
                      if (error) setError('');
                    }}
                    disabled={isLoading}
                    className={`w-full h-11 pl-10 pr-4 bg-surfaceHover border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 ${
                      error ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
                    }`}
                  />
                </div>
                {error && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-1">{error}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex justify-center text-sm font-semibold shadow-soft"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Надсилання...
                  </>
                ) : (
                  'Надіслати лінк'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold">Лист надіслано!</h2>
            <p className="text-sm text-textMuted max-w-xs mx-auto">
              Ми надіслали інструкції щодо відновлення пароля на адресу <strong className="text-text">{email}</strong>. Будь ласка, перевірте пошту.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSent(false)}
              className="mx-auto"
            >
              Надіслати ще раз
            </Button>
          </div>
        )}

        {/* Back to Login link */}
        <div className="text-center mt-6 pt-4 border-t border-border/40">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-textMuted hover:text-text transition-colors gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Повернутися до входу
          </Link>
        </div>
      </div>
    </div>
  );
};
