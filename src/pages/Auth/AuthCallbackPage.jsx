import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Handles post-OAuth redirect. AuthContext resolves the session automatically
// via onAuthStateChange; we just wait for loading to finish then redirect home.
export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) navigate('/', { replace: true });
  }, [loading, user, navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text-muted)',
      fontSize: 14,
    }}>
      Signing in…
    </div>
  );
}
