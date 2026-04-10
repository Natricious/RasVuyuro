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
  const { themes = [] } = col.filters || {}

  return movies.filter(movie => {
    // 1. Exact slug match — also normalize underscore → hyphen (pipeline movies use
    //    values like "ancient_rome" but collection slugs use "ancient-rome")
    const normalizedColls = (movie.collections || []).map(c => c.replace(/_/g, '-'))
    if (normalizedColls.includes(slug)) return true

    // 2. Theme overlap only — genres and timeline are NOT standalone match conditions
    //    because they are too broad (e.g. all Crime movies would match "Heists").
    return themes.length > 0 && themes.some(t => (movie.themes || []).includes(t))
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
