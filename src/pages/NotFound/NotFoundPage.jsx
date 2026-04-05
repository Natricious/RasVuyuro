import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';

export default function NotFoundPage() {
  const { lang } = useLang();

  const text = {
    ka: {
      title: 'გვერდი ვერ მოიძებნა',
      desc: 'კინო მოძებნე და დაუბრუნდი მთავარ გვერდს',
      home: 'მთავარი გვერდი',
      search: 'მირჩიე ფილმი'
    },
    en: {
      title: 'Page not found',
      desc: 'Search for a movie and return to homepage',
      home: 'Homepage',
      search: 'Recommend a movie'
    }
  };

  const t = text[lang] || text.ka;

  return (
    <main style={{
      textAlign: 'center',
      padding: '160px 24px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--gold)" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ animation: 'floatY 4s ease-in-out infinite' }}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 3v18" />
          <path d="M17 3v18" />
          <path d="M3 7.5h4" />
          <path d="M3 12h18" />
          <path d="M3 16.5h4" />
          <path d="M17 7.5h4" />
          <path d="M17 16.5h4" />
        </svg>
      </div>
      
      <h1 style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: '6rem', 
        fontWeight: 800, 
        color: 'var(--gold)',
        lineHeight: 1,
        marginBottom: '16px',
        textShadow: '0 0 40px rgba(232, 197, 71, 0.2)' 
      }}>
        404
      </h1>
      
      <h2 style={{ 
        fontSize: '2rem', 
        color: 'var(--fg)', 
        marginBottom: '16px',
        fontWeight: 600 
      }}>
        {t.title}
      </h2>
      
      <p style={{ 
        color: 'var(--fg-muted)', 
        fontSize: '1.125rem',
        marginBottom: '40px',
        maxWidth: '400px'
      }}>
        {t.desc}
      </p>

      <div style={{ 
        display: 'flex', 
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center' 
      }}>
        <Link 
          to="/" 
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--fg)',
            borderRadius: '8px',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'var(--fg)';
          }}
        >
          {t.home}
        </Link>
        <Link 
          to="/" 
          state={{ openWizard: true }}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--gold)',
            color: '#000',
            borderRadius: '8px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(232, 197, 71, 0.2)',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 197, 71, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(232, 197, 71, 0.2)';
          }}
        >
          {t.search}
        </Link>
      </div>
    </main>
  );
}
