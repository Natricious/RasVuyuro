import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatButton from './components/ChatButton/ChatButton';
import Home from './pages/Home/Home';
import MoviesPage from './pages/Movies/MoviesPage';
import CollectionsPage from './pages/Collections/CollectionsPage';
import CollectionDetailPage from './pages/Collections/CollectionDetailPage';
import MovieDetailPage from './pages/MovieDetail/MovieDetailPage';
import WatchedPage from './pages/Watched/WatchedPage';
import PlannedPage from './pages/Planned/PlannedPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function TimelinePage() {
  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 48px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--fg)', marginBottom: '8px' }}>ქრონოლოგია</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>ისტორიული ქრონოლოგია</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionDetailPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/watched" element={<WatchedPage />} />
        <Route path="/planned" element={<PlannedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ChatButton />
    </>
  );
}
