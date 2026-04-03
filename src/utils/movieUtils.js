import moviesData from '../data/movies.json';
import COLLECTIONS from '../data/collections.js';

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

export function getMoviesByCollectionSlug(slug) {
  const col = COLLECTIONS.find(c => c.slug === slug);
  if (!col) return [];
  const { themes = [], timeline = [], genres = [] } = col.filters;
  return ALL_MOVIES.filter(movie => {
    const themeMatch = themes.length === 0 ||
      themes.some(t => (movie.themes || []).includes(t));
    const timelineMatch = timeline.length === 0 ||
      timeline.includes(movie.timeline);
    const genreMatch = genres.length === 0 ||
      genres.some(g => (movie.genres || []).includes(g));
    return themeMatch && timelineMatch && genreMatch;
  });
}

export function searchMovies(query) {
  const q = query.toLowerCase();
  return ALL_MOVIES.filter(movie =>
    movie.title.toLowerCase().includes(q) ||
    (movie.title_ge && movie.title_ge.toLowerCase().includes(q))
  );
}
