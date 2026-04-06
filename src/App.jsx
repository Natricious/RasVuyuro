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
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

export default function App() {
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}
