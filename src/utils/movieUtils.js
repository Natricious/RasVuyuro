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
    // 1. Exact slug match — also normalize underscore → hyphen (pipeline movies use
    //    values like "ancient_rome" but collection slugs use "ancient-rome")
    const normalizedColls = (movie.collections || []).map(c => c.replace(/_/g, '-'))
    if (normalizedColls.includes(slug)) return true

    // 2. OR fallback: match via themes, genres, or timeline from the collection's filters.
    //    This catches pipeline-imported movies that have genres/timeline but not the exact slug.
    const themeMatch    = themes.length > 0   && themes.some(t => (movie.themes || []).includes(t))
    const genreMatch    = genres.length > 0   && genres.some(g => (movie.genres || []).includes(g))
    const timelineMatch = timeline.length > 0 && timeline.includes(movie.timeline)

    return themeMatch || genreMatch || timelineMatch
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
