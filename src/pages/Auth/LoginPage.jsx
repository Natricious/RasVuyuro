import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import './Auth.css';

const T = {
  ka: {
    title: 'შესვლა',
    subtitle: 'კინო-გიდში მოგესალმებით',
    email: 'ელ-ფოსტა',
    password: 'პაროლი',
    submit: 'შესვლა',
    google: 'Google-ით შესვლა',
    or: 'ან',
    noAccount: 'არ გაქვს ანგარიში?',
    register: 'დარეგისტრირდი',
    errInvalid: 'არასწორი ელ-ფოსტა ან პაროლი',
    errNotConfirmed: 'გთხოვთ დაადასტუროთ ელ-ფოსტა შესვლამდე',
    errGeneric: 'შეცდომა. სცადე თავიდან.',
  },
  en: {
    title: 'Sign In',
    subtitle: 'Welcome back to CineGuide',
    email: 'Email',
    password: 'Password',
    submit: 'Sign In',
    google: 'Continue with Google',
    or: 'or',
    noAccount: "Don't have an account?",
    register: 'Register',
    errInvalid: 'Wrong email or password',
    errNotConfirmed: 'Please confirm your email first',
    errGeneric: 'Something went wrong. Please try again.',
  },
};

export default function LoginPage() {
  const { lang } = useLang();
  const t = T[lang];
  const { user, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      console.log('Login error:', err.message, err.status);
      const msg = err.message.toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setError(t.errNotConfirmed);
      } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('wrong') || err.status === 400) {
        setError(t.errInvalid);
      } else {
        setError(`${t.errGeneric} (${err.message})`);
      }
    }
    // navigation handled by useEffect above
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

        {error && <p className="auth-error">{error}</p>}

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
              autoComplete="current-password"
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
          {t.noAccount} <Link to="/register">{t.register}</Link>
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
