import moviesData from '../data/movies.json';

const ALL_MOVIES = moviesData;

export function getMoviesByCollection(collectionKey) {
  return ALL_MOVIES.filter(movie =>
    movie.collections.includes(collectionKey)
  );
}

export function getMovieById(id) {
  return ALL_MOVIES.find(movie => movie.id === id) ?? null;
}

export function getSimilarMovies(movieId) {
  const movie = getMovieById(movieId);
  if (!movie) return [];
  return movie.similar_movies
    .map(id => getMovieById(id))
    .filter(Boolean);
}

export function searchMovies(query) {
  const q = query.toLowerCase();
  return ALL_MOVIES.filter(movie =>
    movie.title.toLowerCase().includes(q) ||
    (movie.title_ge && movie.title_ge.toLowerCase().includes(q))
  );
}
