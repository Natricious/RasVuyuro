import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('rasvuyuro-lang') ?? 'ka'
  );

  const toggleLang = () => {
    const next = lang === 'ka' ? 'en' : 'ka';
    localStorage.setItem('rasvuyuro-lang', next);
    setLang(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
