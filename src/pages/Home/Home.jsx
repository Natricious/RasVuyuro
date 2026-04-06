import HeroBanner from '../../components/HeroBanner/HeroBanner';
import MovieRow from '../../components/MovieRow/MovieRow';
import ThematicCollections from '../../components/ThematicCollections/ThematicCollections';
import NewMovies from '../../components/NewMovies/NewMovies';
import { useTrendingMovies, useNewMovies } from '../../hooks/useMovies';
import { useLang } from '../../context/LanguageContext';
import { T } from '../../data/translations';

export default function Home() {
  const { lang } = useLang();
  const { movies: trendingMovies } = useTrendingMovies(20);
  const { movies: newMovies }      = useNewMovies(6);

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

    </main>
  );
}
