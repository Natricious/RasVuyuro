import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Shared query cache (session-scoped) ───────────────────────────────────────
// Bump CACHE_V whenever LIST_FIELDS changes to invalidate all stale cached data.
const CACHE_V = 2
const queryCache = new Map()

function ck(...parts) {
  return JSON.stringify([CACHE_V, ...parts])
}

// Fields needed for movie cards / lists — skip description & sources
const LIST_FIELDS =
  'id,title,title_ge,year,imdb_id,imdb_rating,genres,themes,timeline,tone,poster,collections,similar_movies,description,description_ka'

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

// ── Shared: build PostgREST filter for collection matching ────────────────────
// Matches ONLY on movie.collections[] containing the slug.
// Theme/genre fallbacks were removed — they caused unrelated movies to appear.
// movie.collections[] is now populated with exact slug values by assignCollections.js.
function buildCollectionOrFilter(slug) {
  // Also accept the underscore variant for legacy data (ancient_rome → ancient-rome)
  const underscoreSlug = slug.replace(/-/g, '_')
  const parts = [`collections.cs.{"${slug}"}`]
  if (underscoreSlug !== slug) parts.push(`collections.cs.{"${underscoreSlug}"}`)
  return parts.join(',')
}

// ── useCollectionCounts ───────────────────────────────────────────────────────
// Returns { [slug]: count } for all collections without loading any movie data.
// Fires parallel HEAD count queries (very lightweight), updates progressively.
export function useCollectionCounts(collections) {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    if (!collections.length) return
    let cancelled = false

    const BATCH = 10
    async function run() {
      const result = {}
      for (let i = 0; i < collections.length; i += BATCH) {
        if (cancelled) break
        const batch = collections.slice(i, i + BATCH)
        const settled = await Promise.allSettled(
          batch.map(async col => {
            const cacheKey = ck('count', col.slug)
            if (queryCache.has(cacheKey)) return { slug: col.slug, count: queryCache.get(cacheKey) }
            const orFilter = buildCollectionOrFilter(col.slug)
            const { data, error } = await supabase
              .from('movies')
              .select('id')
              .or(orFilter)
            const n = (!error && data) ? new Set(data.map(m => m.id)).size : 0
            queryCache.set(cacheKey, n)
            return { slug: col.slug, count: n }
          })
        )
        if (cancelled) break
        settled.forEach(r => { if (r.status === 'fulfilled') result[r.value.slug] = r.value.count })
        setCounts(prev => ({ ...prev, ...result }))
      }
    }
    run()
    return () => { cancelled = true }
  }, [collections.length])

  return counts
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
      .select(LIST_FIELDS)

    q = q.or(buildCollectionOrFilter(slug))

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

    q = q.order('id', { ascending: true })

    let countQ = supabase.from('movies').select('id').or(buildCollectionOrFilter(slug))
    if (minRating > 0)            countQ = countQ.gte('imdb_rating', minRating)
    if (selectedGenre !== 'all')  countQ = countQ.contains('genres', [selectedGenre])
    if (yearRange === 'classic')  countQ = countQ.lt('year', 1990)
    else if (yearRange === '90s') countQ = countQ.gte('year', 1990).lt('year', 2000)
    else if (yearRange === '2000s') countQ = countQ.gte('year', 2000).lt('year', 2010)
    else if (yearRange === '2010s') countQ = countQ.gte('year', 2010).lt('year', 2020)
    else if (yearRange === '2020s') countQ = countQ.gte('year', 2020)

    Promise.all([
      q.range(from, to),
      countQ
    ]).then(([ { data, error }, { data: allData, error: countError } ]) => {
      if (!error && data) {
        const totalCount = (!countError && allData) ? new Set(allData.map(m => m.id)).size : 0
        const result = { movies: data, total: totalCount }
        queryCache.set(key, result)
        setMovies(data)
        setTotal(totalCount)
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
  const [loading,       setLoading]       = useState(() => !queryCache.has(key))
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
      .select(LIST_FIELDS)

    if (debouncedQuery.length >= 3) {
      q = q.or(`title.ilike.%${debouncedQuery}%,title_ge.ilike.%${debouncedQuery}%`)
    }
    if (genre)    q = q.contains('genres', [genre])
    if (timeline) q = q.eq('timeline', timeline)

    if      (sort === 'year_desc') q = q.order('year',        { ascending: false })
    else if (sort === 'year_asc')  q = q.order('year',        { ascending: true  })
    else if (sort === 'title')     q = q.order('title',       { ascending: true  })
    else                           q = q.order('imdb_rating', { ascending: false })

    q = q.order('id', { ascending: true })

    let countQ = supabase.from('movies').select('id')
    if (debouncedQuery.length >= 3) {
      countQ = countQ.or(`title.ilike.%${debouncedQuery}%,title_ge.ilike.%${debouncedQuery}%`)
    }
    if (genre)    countQ = countQ.contains('genres', [genre])
    if (timeline) countQ = countQ.eq('timeline', timeline)

    Promise.all([
      q.range(from, to),
      countQ
    ]).then(([ { data, error }, { data: allData, error: countError } ]) => {
      if (!error && data) {
        const totalCount = (!countError && allData) ? new Set(allData.map(m => m.id)).size : 0
        const result = { movies: data, total: totalCount }
        queryCache.set(activeKey, result)
        setMovies(data)
        setTotal(totalCount)
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

// ── useMovieDetail ────────────────────────────────────────────────────────────
// Fetches a single movie by ID plus its similar movies — used by MovieDetailPage.
// Two targeted queries instead of loading all 6112 movies.
export function useMovieDetail(id) {
  const numId = Number(id)
  const key = ck('detail', numId)

  const [movie,   setMovie]   = useState(() => queryCache.get(key)?.movie   ?? null)
  const [similar, setSimilar] = useState(() => queryCache.get(key)?.similar ?? [])
  const [loading, setLoading] = useState(!queryCache.has(key))

  useEffect(() => {
    if (!numId) return
    if (queryCache.has(key)) return

    setLoading(true)

    supabase
      .from('movies')
      .select(LIST_FIELDS)
      .eq('id', numId)
      .single()
      .then(async ({ data: m, error }) => {
        if (error || !m) { setLoading(false); return }

        // Fetch similar movies in one query if any IDs exist
        const similarIds = m.similar_movies || []
        let similarData = []
        if (similarIds.length > 0) {
          const { data } = await supabase
            .from('movies')
            .select(LIST_FIELDS)
            .in('id', similarIds)
          similarData = data || []
        }

        queryCache.set(key, { movie: m, similar: similarData })
        setMovie(m)
        setSimilar(similarData)
        setLoading(false)
      })
  }, [key, numId])

  return { movie, similar, loading }
}

// ── useMovies (backward compat) ───────────────────────────────────────────────
// Fetches ALL movies via internal pagination. Used by WizardModal etc.
// Cached for session lifetime.
let allMoviesCacheV2 = null

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
  const [movies,  setMovies]  = useState(allMoviesCacheV2 || [])
  const [loading, setLoading] = useState(!allMoviesCacheV2)

  useEffect(() => {
    if (allMoviesCacheV2) return
    fetchAllMovies().then(data => {
      allMoviesCacheV2 = data
      setMovies(data)
      setLoading(false)
    })
  }, [])

  return { movies, loading }
}
