import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

let cache = null

const mapCollection = (c) => ({
  ...c,
  name: c.title_ka,
  title: c.title_en,
  imageUrl: c.image_url,
  accentColor: c.color,
  gradient: `linear-gradient(135deg, ${c.color}33 0%, rgba(10,7,9,0.7) 100%)`,
})

export function useCollections() {
  const [collections, setCollections] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    supabase
      .from('collections')
      .select('*')
      .eq('is_visible', true)
      .order('display_order')
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map(mapCollection)
          cache = mapped
          setCollections(mapped)
        }
        setLoading(false)
      })
  }, [])

  return { collections, loading }
}
