import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

let cache = null

export function useMovies() {
  const [movies, setMovies] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    supabase
      .from('movies')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) {
          cache = data
          setMovies(data)
        }
        setLoading(false)
      })
  }, [])

  return { movies, loading }
}
