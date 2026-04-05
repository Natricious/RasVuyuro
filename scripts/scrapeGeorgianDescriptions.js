/**
 * scrapeGeorgianDescriptions.js
 *
 * Fetches Georgian movie descriptions from ge.movie and saves them to Supabase.
 *
 * Usage:  node scripts/scrapeGeorgianDescriptions.js
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env (project root).
 * Requires @supabase/supabase-js (already in dependencies).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load .env manually (import.meta.env is Vite-only) ─────────────────────────
function loadEnv(path = '.env') {
  if (!existsSync(path)) throw new Error('.env file not found at ' + path)
  const lines = readFileSync(path, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    process.env[key] = val
  }
}

loadEnv()

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Config ────────────────────────────────────────────────────────────────────
const BATCH_SIZE      = 5
const BATCH_DELAY_MS  = 1000
const LOG_EVERY       = 50
const FAILURES_FILE   = 'scripts/data/description_failures.json'
const GE_MOVIE_SEARCH = 'https://ge.movie/api/search/suggestions?type=search&search='
const GE_MOVIE_BASE   = 'https://ge.movie/movie'

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Normalize title for loose comparison */
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Levenshtein distance — used as tiebreaker */
function lev(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * Search ge.movie for a movie by title.
 * Returns the best matching result object or null.
 */
async function findGemovieEntry(movie) {
  const query = encodeURIComponent(movie.title)
  const url   = GE_MOVIE_SEARCH + query

  let data
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return null
    data = await res.json()
  } catch {
    return null
  }

  const candidates = data?.data || []
  if (candidates.length === 0) return null

  // 1. IMDb ID exact match (most reliable)
  if (movie.imdb_id) {
    const byImdb = candidates.find(c => c.imdb_id === movie.imdb_id)
    if (byImdb) return byImdb
  }

  // 2. Title + year match
  const titleNorm = norm(movie.title)
  const yearStr   = String(movie.year)
  const byTitleYear = candidates.filter(c =>
    norm(c.original_title) === titleNorm && String(c.year) === yearStr
  )
  if (byTitleYear.length === 1) return byTitleYear[0]
  if (byTitleYear.length > 1) {
    // Prefer shortest Levenshtein distance
    return byTitleYear.reduce((best, c) =>
      lev(norm(c.original_title), titleNorm) < lev(norm(best.original_title), titleNorm) ? c : best
    )
  }

  // 3. Title-only match (any year)
  const byTitle = candidates.filter(c => norm(c.original_title) === titleNorm)
  if (byTitle.length > 0) return byTitle[0]

  return null
}

/**
 * Fetch ge.movie detail page and extract the Georgian description
 * from <meta name="description" content="...">.
 */
async function fetchDescription(gemovieId) {
  const url = `${GE_MOVIE_BASE}/${gemovieId}/movie`
  let html
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return null
    html = await res.text()
  } catch {
    return null
  }

  const match = html.match(/name="description"\s+content="([^"]*)"/)
  if (!match) return null
  const desc = match[1].trim()
  return desc.length > 0 ? desc : null
}

const PAGE_SIZE = 1000  // Supabase rows per fetch

/** Fetch one page of movies needing description_ka */
async function fetchPage(from) {
  const to = from + PAGE_SIZE - 1
  const { data, error } = await supabase
    .from('movies')
    .select('id,title,year,imdb_id')
    .or('description_ka.is.null,description_ka.eq.')
    .order('id')
    .range(from, to)

  if (error) {
    console.error(`Supabase fetch error (range ${from}-${to}):`, error.message)
    process.exit(1)
  }
  return data || []
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Load existing failures so we can append
  let failures = []
  if (existsSync(FAILURES_FILE)) {
    try { failures = JSON.parse(readFileSync(FAILURES_FILE, 'utf8')) } catch {}
  }
  const failedIds = new Set(failures.map(f => f.id))

  // Get total count of movies needing processing
  const { count: totalNeeding } = await supabase
    .from('movies')
    .select('id', { count: 'exact', head: true })
    .or('description_ka.is.null,description_ka.eq.')

  console.log(`Movies needing description_ka: ${totalNeeding ?? '?'} (${failures.length} previously failed/skipped)`)

  let processed = 0
  let succeeded = 0
  let newFailures = 0
  let pageFrom   = 0
  let grandTotal = 0

  // Paginate through all movies needing descriptions
  while (true) {
    const page = await fetchPage(pageFrom)
    if (page.length === 0) break

    const todo = page.filter(m => !failedIds.has(m.id))
    grandTotal += todo.length

    for (let i = 0; i < todo.length; i += BATCH_SIZE) {
      const batch = todo.slice(i, i + BATCH_SIZE)

      await Promise.all(batch.map(async movie => {
        processed++

        // Find on ge.movie
        const entry = await findGemovieEntry(movie)
        if (!entry) {
          failures.push({ id: movie.id, title: movie.title, year: movie.year, reason: 'not_found_on_gemovie' })
          newFailures++
          return
        }

        // Fetch description
        const desc = await fetchDescription(entry.id)
        if (!desc) {
          failures.push({ id: movie.id, title: movie.title, year: movie.year, gemovie_id: entry.id, reason: 'no_description' })
          newFailures++
          return
        }

        // Save to Supabase
        const { error: upsertErr } = await supabase
          .from('movies')
          .update({ description_ka: desc })
          .eq('id', movie.id)

        if (upsertErr) {
          failures.push({ id: movie.id, title: movie.title, year: movie.year, gemovie_id: entry.id, reason: 'supabase_error', detail: upsertErr.message })
          newFailures++
          return
        }

        succeeded++
      }))

      // Log progress every LOG_EVERY movies
      const total = totalNeeding ?? '?'
      if (processed % LOG_EVERY === 0) {
        console.log(`[${processed}/${total}] ✓ ${succeeded} saved, ✗ ${newFailures} failed`)
      }

      // Persist failures after each batch
      if (newFailures > 0) {
        writeFileSync(FAILURES_FILE, JSON.stringify(failures, null, 2))
      }

      // Rate-limit between batches (skip after last batch on last page)
      if (i + BATCH_SIZE < todo.length || page.length === PAGE_SIZE) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    // Log at end of each page
    const total = totalNeeding ?? '?'
    console.log(`[${processed}/${total}] ✓ ${succeeded} saved, ✗ ${newFailures} failed  ← page ${pageFrom / PAGE_SIZE + 1} done`)

    if (page.length < PAGE_SIZE) break  // last page
    pageFrom += PAGE_SIZE
  }

  // Final failure file write
  writeFileSync(FAILURES_FILE, JSON.stringify(failures, null, 2))

  console.log('\nDone.')
  console.log(`  Saved:   ${succeeded}`)
  console.log(`  Failed:  ${newFailures}`)
  console.log(`  Failures logged to: ${FAILURES_FILE}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
