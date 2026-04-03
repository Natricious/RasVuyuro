import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatButton from './components/ChatButton/ChatButton';
import Home from './pages/Home/Home';
import CollectionsPage from './pages/Collections/CollectionsPage';
import CollectionDetailPage from './pages/Collections/CollectionDetailPage';
import MovieDetailPage from './pages/MovieDetail/MovieDetailPage';

function MoviesPage() {
  return (
    <main style={{ paddingTop: 'calc(var(--navbar-height) + 48px)', paddingBottom: '96px', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--fg)', marginBottom: '8px' }}>ფილმები</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.9375rem' }}>ყველა ფილმი</p>
      </div>
    </main>
  );
}

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

function NotFound() {
  return (
    <main style={{ textAlign: 'center', padding: '160px 24px', minHeight: '100vh' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 700, color: 'var(--gold)' }}>404</p>
      <p style={{ color: 'var(--fg-muted)', marginTop: '12px' }}>გვერდი ვერ მოიძებნა</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionDetailPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <ChatButton />
    </>
  );
}
