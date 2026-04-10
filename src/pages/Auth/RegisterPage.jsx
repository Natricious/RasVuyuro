import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import './Auth.css';

const T = {
  ka: {
    title: 'რეგისტრაცია',
    subtitle: 'შექმენი ანგარიში',
    email: 'ელ-ფოსტა',
    password: 'პაროლი',
    confirmPassword: 'გაიმეორე პაროლი',
    submit: 'დარეგისტრირდი',
    google: 'Google-ით რეგისტრაცია',
    or: 'ან',
    hasAccount: 'უკვე გაქვს ანგარიში?',
    login: 'შესვლა',
    errMatch: 'პაროლები არ ემთხვევა',
    errWeak: 'პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს',
    errExists: 'ეს ელ-ფოსტა უკვე დარეგისტრირებულია',
    errGeneric: 'შეცდომა. სცადე თავიდან.',
    checkEmail: 'შეამოწმე ელ-ფოსტა დასადასტურებლად',
  },
  en: {
    title: 'Create Account',
    subtitle: 'Join CineGuide',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Create Account',
    google: 'Continue with Google',
    or: 'or',
    hasAccount: 'Already have an account?',
    login: 'Sign In',
    errMatch: 'Passwords do not match',
    errWeak: 'Password must be at least 6 characters',
    errExists: 'An account with this email already exists',
    errGeneric: 'Something went wrong. Please try again.',
    checkEmail: 'Check your email to confirm your account',
  },
};

export default function RegisterPage() {
  const { lang } = useLang();
  const t = T[lang];
  const { user, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) { setError(t.errWeak); return; }
    if (password !== confirm) { setError(t.errMatch); return; }

    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);

    if (err) {
      if (err.message.includes('already registered') || err.message.includes('already exists')) {
        setError(t.errExists);
      } else {
        setError(t.errGeneric);
      }
    } else {
      setSuccess(t.checkEmail);
    }
  }

  async function handleGoogle() {
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) setError(t.errGeneric);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span>🎬</span> CineGuide
        </Link>

        <h1 className="auth-title">{t.title}</h1>
        <p className="auth-subtitle">{t.subtitle}</p>

        {error   && <p className="auth-error">{error}</p>}
        {success && (
          <p style={{
            fontSize: 13, color: '#22c55e',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 6, padding: '8px 12px', textAlign: 'center',
          }}>
            {success}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label>{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label>{t.confirmPassword}</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '...' : t.submit}
          </button>
        </form>

        <div className="auth-divider"><span>{t.or}</span></div>

        <button className="auth-google" onClick={handleGoogle}>
          <GoogleIcon />
          {t.google}
        </button>

        <p className="auth-footer">
          {t.hasAccount} <Link to="/login">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
