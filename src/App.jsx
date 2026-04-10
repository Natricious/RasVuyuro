import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import MoviesPage from './pages/Movies/MoviesPage';
import CollectionsPage from './pages/Collections/CollectionsPage';
import CollectionDetailPage from './pages/Collections/CollectionDetailPage';
import MovieDetailPage from './pages/MovieDetail/MovieDetailPage';
import WatchedPage from './pages/Watched/WatchedPage';
import PlannedPage from './pages/Planned/PlannedPage';
import WizardTestPage from './pages/WizardTest/WizardTestPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AuthCallbackPage from './pages/Auth/AuthCallbackPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { loading } = useAuth();

  // Hold render until initial session is resolved — prevents flash on OAuth redirect
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionDetailPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/watched" element={<WatchedPage />} />
        <Route path="/planned" element={<PlannedPage />} />
        <Route path="/wizard-test" element={<WizardTestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}
