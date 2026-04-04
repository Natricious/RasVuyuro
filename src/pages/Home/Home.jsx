import { useMemo } from 'react';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import MovieRow from '../../components/MovieRow/MovieRow';
import ThematicCollections from '../../components/ThematicCollections/ThematicCollections';
import NewMovies from '../../components/NewMovies/NewMovies';
import Timeline from '../../components/Timeline/Timeline';
import { useMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';

export default function Home() {
  const { movies } = useMovies();
  const { lang } = useLang();

  const trendingMovies = useMemo(
    () => movies
      .filter(m => (m.imdb_rating ?? 0) >= 8.0)
      .sort((a, b) => (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0))
      .slice(0, 6),
    [movies]
  );

  const newMovies = useMemo(
    () => movies
      .slice()
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, 6),
    [movies]
  );

  return (
    <main>
      <HeroBanner />

      <MovieRow
        label={T[lang].trendingLabel}
        title={T[lang].trendingTitle}
        description={T[lang].trendingDesc}
        movies={trendingMovies}
        viewAllTo="/movies"
      />

      <ThematicCollections />

      <NewMovies movies={newMovies} />

      <Timeline />
    </main>
  );
}
