import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { WatchedProvider } from './context/WatchedContext';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <WatchedProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </WatchedProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
);
