import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

const STRINGS = {
  ka: {
    title:   'ანგარიში',
    email:   'ელ-ფოსტა',
    joined:  'რეგისტრაცია',
    signOut: 'გასვლა',
  },
  en: {
    title:   'Account',
    email:   'Email',
    joined:  'Joined',
    signOut: 'Sign Out',
  },
};

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const t = STRINGS[lang];

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(
        lang === 'ka' ? 'ka-GE' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : null;

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--fg)' }}>
            {t.title}
          </h1>
        </div>

        <div style={{
          maxWidth: '480px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>

          {/* Avatar + email */}
          <div style={{
            padding: '28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--gold)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.375rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {user.email[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginBottom: '3px' }}>
                {t.email}
              </div>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--fg)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* Joined date */}
          {joinedDate && (
            <div style={{
              padding: '14px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>{t.joined}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--fg)' }}>{joinedDate}</span>
            </div>
          )}

          {/* Sign out */}
          <div style={{ padding: '20px 28px' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '11px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}
            >
              {t.signOut}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
