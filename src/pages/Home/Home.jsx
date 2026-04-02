import HeroBanner from '../../components/HeroBanner/HeroBanner';
import MovieRow from '../../components/MovieRow/MovieRow';
import ThematicCollections from '../../components/ThematicCollections/ThematicCollections';
import NewMovies from '../../components/NewMovies/NewMovies';
import Timeline from '../../components/Timeline/Timeline';
import { TRENDING_MOVIES } from '../../data/movies';

export default function Home() {
  return (
    <main>
      <HeroBanner />

      <MovieRow
        label="ტოპ ფილმები"
        title="ტრენდულობაში"
        description="ყველაზე ხედული ფილმები ამ კვირაში"
        movies={TRENDING_MOVIES}
        viewAllTo="/movies"
      />

      <ThematicCollections />

      <NewMovies />

      <Timeline />
    </main>
  );
}
