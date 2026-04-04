import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Shared query cache (session-scoped) ───────────────────────────────────────
const queryCache = new Map()

function ck(...parts) {
  return JSON.stringify(parts)
}

// Fields needed for movie cards / lists — skip description & sources
const LIST_FIELDS =
  'id,title,title_ge,year,imdb_id,imdb_rating,genres,themes,timeline,tone,poster,collections,similar_movies'

// ── useTrendingMovies ─────────────────────────────────────────────────────────
// Fetches top N movies by IMDb rating.
export function useTrendingMovies(limit = 10) {
  const key = ck('trending', limit)
  const [movies, setMovies] = useState(() => queryCache.get(key) || [])
  const [loading, setLoading] = useState(!queryCache.has(key))

  useEffect(() => {
    if (queryCache.has(key)) return
    supabase
      .from('movies')
      .select(LIST_FIELDS)
      .gte('imdb_rating', 7)
      .order('imdb_rating', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error && data) { queryCache.set(key, data); setMovies(data) }
        setLoading(false)
      })
  }, [key])

  return { movies, loading }
}

// ── useNewMovies ──────────────────────────────────────────────────────────────
// Fetches top N movies by release year (most recent first).
export function useNewMovies(limit = 10) {
  const key = ck('new', limit)
  const [movies, setMovies] = useState(() => queryCache.get(key) || [])
  const [loading, setLoading] = useState(!queryCache.has(key))

  useEffect(() => {
    if (queryCache.has(key)) return
    supabase
      .from('movies')
      .select(LIST_FIELDS)
      .not('year', 'is', null)
      .order('year', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error && data) { queryCache.set(key, data); setMovies(data) }
        setLoading(false)
      })
  }, [key])

  return { movies, loading }
}

// ── useCollectionMovies ───────────────────────────────────────────────────────
// Fetches movies for a collection using server-side filters + pagination.
//
// collection: object from useCollections() — must have .slug and .filters
// filters:    { sortBy, minRating, selectedGenre, yearRange }
// page:       0-indexed, each page appends to results via "Load More"
// pageSize:   rows per page (default 20)
//
// Returns { movies, total, loading, loadMore, hasMore }
export function useCollectionMovies(collection, filters = {}, page = 0, pageSize = 20) {
  const {
    sortBy       = 'rating',
    minRating    = 0,
    selectedGenre = 'all',
    yearRange    = 'all',
  } = filters

  const slug = collection?.slug
  const key  = ck('collection', slug, sortBy, minRating, selectedGenre, yearRange, page, pageSize)

  const [movies,  setMovies]  = useState(() => queryCache.get(key)?.movies || [])
  const [total,   setTotal]   = useState(() => queryCache.get(key)?.total  ?? null)
  const [loading, setLoading] = useState(!queryCache.has(key) && !!collection)

  useEffect(() => {
    if (!collection) return

    if (queryCache.has(key)) {
      const cached = queryCache.get(key)
      setMovies(cached.movies)
      setTotal(cached.total)
      setLoading(false)
      return
    }

    setLoading(true)
    const from = page * pageSize
    const to   = from + pageSize - 1

    let q = supabase
      .from('movies')
      .select(LIST_FIELDS, { count: 'exact' })

    // Collection-level filters (from Supabase collections.filters jsonb)
    const cf = collection.filters || {}
    if (cf.themes?.length)   q = q.overlaps('themes',   cf.themes)
    if (cf.timeline?.length) q = q.in('timeline',       cf.timeline)
    if (cf.genres?.length)   q = q.overlaps('genres',   cf.genres)

    // User filters
    if (minRating > 0)            q = q.gte('imdb_rating', minRating)
    if (selectedGenre !== 'all')  q = q.contains('genres', [selectedGenre])
    if (yearRange === 'classic')  q = q.lt('year', 1990)
    else if (yearRange === '90s') q = q.gte('year', 1990).lt('year', 2000)
    else if (yearRange === '2000s') q = q.gte('year', 2000).lt('year', 2010)
    else if (yearRange === '2010s') q = q.gte('year', 2010).lt('year', 2020)
    else if (yearRange === '2020s') q = q.gte('year', 2020)

    // Sort
    if      (sortBy === 'year_desc') q = q.order('year',        { ascending: false })
    else if (sortBy === 'year_asc')  q = q.order('year',        { ascending: true  })
    else if (sortBy === 'title')     q = q.order('title',       { ascending: true  })
    else                             q = q.order('imdb_rating', { ascending: false })

    q.range(from, to).then(({ data, error, count }) => {
      if (!error && data) {
        const result = { movies: data, total: count }
        queryCache.set(key, result)
        setMovies(data)
        setTotal(count)
      }
      setLoading(false)
    })
  }, [key, collection])

  return { movies, total, loading }
}

// ── useFilteredMovies ─────────────────────────────────────────────────────────
// Server-side filtered + paginated movie list for MoviesPage.
// Search is debounced (fires only after 300ms of no typing, min 3 chars).
// Genre and timeline filters are applied immediately.
//
// Returns { movies, total, loading }
export function useFilteredMovies({ query = '', genre = '', timeline = '', sort = 'rating', page = 0, pageSize = 40 } = {}) {
  const trimmed = query.trim()
  const key = ck('filtered', trimmed, genre, timeline, sort, page, pageSize)

  const [movies,        setMovies]        = useState(() => queryCache.get(key)?.movies || [])
  const [total,         setTotal]         = useState(() => queryCache.get(key)?.total  ?? null)
  const [loading,       setLoading]       = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed)
  const timerRef = useRef(null)

  // Debounce the search query
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (trimmed.length === 0 || trimmed.length >= 3) {
      timerRef.current = setTimeout(() => setDebouncedQuery(trimmed), 300)
    }
    return () => clearTimeout(timerRef.current)
  }, [trimmed])

  const activeKey = ck('filtered', debouncedQuery, genre, timeline, sort, page, pageSize)

  useEffect(() => {
    if (queryCache.has(activeKey)) {
      const cached = queryCache.get(activeKey)
      setMovies(cached.movies)
      setTotal(cached.total)
      setLoading(false)
      return
    }

    setLoading(true)
    const from = page * pageSize
    const to   = from + pageSize - 1

    let q = supabase
      .from('movies')
      .select(LIST_FIELDS, { count: 'exact' })

    if (debouncedQuery.length >= 3) {
      q = q.or(`title.ilike.%${debouncedQuery}%,title_ge.ilike.%${debouncedQuery}%`)
    }
    if (genre)    q = q.contains('genres', [genre])
    if (timeline) q = q.eq('timeline', timeline)

    if      (sort === 'year_desc') q = q.order('year',        { ascending: false })
    else if (sort === 'year_asc')  q = q.order('year',        { ascending: true  })
    else if (sort === 'title')     q = q.order('title',       { ascending: true  })
    else                           q = q.order('imdb_rating', { ascending: false })

    q.range(from, to).then(({ data, error, count }) => {
      if (!error && data) {
        const result = { movies: data, total: count }
        queryCache.set(activeKey, result)
        setMovies(data)
        setTotal(count)
      }
      setLoading(false)
    })
  }, [activeKey])

  return { movies, total, loading }
}

// ── useNavSearch ─────────────────────────────────────────────────────────────
// Lightweight navbar search — only fires when query ≥ 3 chars, debounced 300ms.
// Returns { results, loading } where results is at most `limit` movies.
export function useNavSearch(query, limit = 6) {
  const trimmed = query.trim()
  const key = ck('navsearch', trimmed, limit)

  const [results, setResults] = useState(() => queryCache.get(key) || [])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)

    if (trimmed.length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    if (queryCache.has(key)) {
      setResults(queryCache.get(key))
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(() => {
      supabase
        .from('movies')
        .select(LIST_FIELDS)
        .or(`title.ilike.%${trimmed}%,title_ge.ilike.%${trimmed}%`)
        .order('imdb_rating', { ascending: false })
        .limit(limit)
        .then(({ data, error }) => {
          if (!error && data) { queryCache.set(key, data); setResults(data) }
          setLoading(false)
        })
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [trimmed, key, limit])

  return { results, loading }
}

// ── useMovies (backward compat) ───────────────────────────────────────────────
// Fetches ALL movies via internal pagination. Used by ChatButton, WatchedPage,
// PlannedPage, WizardModal, etc. Cached for session lifetime.
let allMoviesCache = null

async function fetchAllMovies() {
  const PAGE = 1000
  const results = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('movies')
      .select(LIST_FIELDS)
      .order('id')
      .range(from, from + PAGE - 1)
    if (error || !data || data.length === 0) break
    results.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return results
}

export function useMovies() {
  const [movies,  setMovies]  = useState(allMoviesCache || [])
  const [loading, setLoading] = useState(!allMoviesCache)

  useEffect(() => {
    if (allMoviesCache) return
    fetchAllMovies().then(data => {
      allMoviesCache = data
      setMovies(data)
      setLoading(false)
    })
  }, [])

  return { movies, loading }
}
