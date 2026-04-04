// All functions accept data arrays as parameters instead of importing local files.
// Call sites are responsible for passing movies/collections from useMovies()/useCollections().

export function getMoviesByCollection(movies, collectionKey) {
  return movies.filter(movie =>
    (movie.collections || []).includes(collectionKey)
  )
}

export function getMovieById(movies, id) {
  return movies.find(movie => movie.id === id) ?? null
}

export function getSimilarMovies(movies, movieId) {
  const movie = getMovieById(movies, movieId)
  if (!movie) return []
  return (movie.similar_movies || [])
    .map(id => getMovieById(movies, id))
    .filter(Boolean)
}

export function getMoviesByCollectionSlug(movies, collections, slug) {
  const col = collections.find(c => c.slug === slug)
  if (!col) return []
  const { themes = [], timeline = [], genres = [] } = col.filters || {}
  return movies.filter(movie => {
    const themeMatch = themes.length === 0 ||
      themes.some(t => (movie.themes || []).includes(t))
    const timelineMatch = timeline.length === 0 ||
      timeline.includes(movie.timeline)
    const genreMatch = genres.length === 0 ||
      genres.some(g => (movie.genres || []).includes(g))
    return themeMatch && timelineMatch && genreMatch
  })
}

export function searchMovies(movies, query) {
  const q = query.toLowerCase()
  return movies.filter(movie =>
    movie.title.toLowerCase().includes(q) ||
    (movie.title_ge && movie.title_ge.toLowerCase().includes(q))
  )
}

export function getMoviesByTimeline(movies, timelineKey) {
  return movies.filter(m => m.timeline === timelineKey)
}
