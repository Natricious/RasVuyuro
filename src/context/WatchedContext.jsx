import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

const WatchedContext = createContext(null);

export function WatchedProvider({ children }) {
  const { user } = useAuth();
  const [watchedIds, setWatchedIds] = useState(() => loadSet('rasvuyuro-watched'));
  const [plannedIds, setPlannedIds] = useState(() => loadSet('rasvuyuro-planned'));
  const prevUserIdRef = useRef(null);

  // Sync with Supabase when user logs in; fall back to localStorage on logout
  useEffect(() => {
    if (!user) {
      if (prevUserIdRef.current !== null) {
        // User just logged out — reload from localStorage
        setWatchedIds(loadSet('rasvuyuro-watched'));
        setPlannedIds(loadSet('rasvuyuro-planned'));
      }
      prevUserIdRef.current = null;
      return;
    }

    const isNewLogin = prevUserIdRef.current === null;
    prevUserIdRef.current = user.id;

    async function sync() {
      // Migrate localStorage data to Supabase on first login
      if (isNewLogin) {
        const localWatched = [...loadSet('rasvuyuro-watched')];
        const localPlanned = [...loadSet('rasvuyuro-planned')];
        if (localWatched.length > 0 || localPlanned.length > 0) {
          const rows = [
            ...localWatched.map(id => ({ user_id: user.id, movie_id: id, list_type: 'watched' })),
            ...localPlanned.map(id => ({ user_id: user.id, movie_id: id, list_type: 'planned' })),
          ];
          await supabase.from('user_lists').upsert(rows, { onConflict: 'user_id,movie_id,list_type' });
          localStorage.removeItem('rasvuyuro-watched');
          localStorage.removeItem('rasvuyuro-planned');
        }
      }

      // Load current state from Supabase
      const { data } = await supabase
        .from('user_lists')
        .select('movie_id, list_type')
        .eq('user_id', user.id);

      const watched = new Set();
      const planned = new Set();
      for (const row of (data || [])) {
        if (row.list_type === 'watched') watched.add(row.movie_id);
        else if (row.list_type === 'planned') planned.add(row.movie_id);
      }
      setWatchedIds(watched);
      setPlannedIds(planned);
    }

    sync();
  }, [user]);

  const isWatched = (id) => watchedIds.has(id);
  const isPlanned = (id) => plannedIds.has(id);

  const toggleWatched = (id) => {
    const adding = !watchedIds.has(id);

    const nextW = new Set(watchedIds);
    if (adding) nextW.add(id); else nextW.delete(id);
    setWatchedIds(nextW);

    // Auto-remove from planned when marking as watched
    if (adding && plannedIds.has(id)) {
      const nextP = new Set(plannedIds);
      nextP.delete(id);
      setPlannedIds(nextP);
      if (!user) saveSet('rasvuyuro-planned', nextP);
      else supabase.from('user_lists').delete()
        .eq('user_id', user.id).eq('movie_id', id).eq('list_type', 'planned');
    }

    if (!user) {
      saveSet('rasvuyuro-watched', nextW);
    } else if (adding) {
      supabase.from('user_lists').upsert(
        { user_id: user.id, movie_id: id, list_type: 'watched' },
        { onConflict: 'user_id,movie_id,list_type' }
      );
    } else {
      supabase.from('user_lists').delete()
        .eq('user_id', user.id).eq('movie_id', id).eq('list_type', 'watched');
    }
  };

  const togglePlanned = (id) => {
    const adding = !plannedIds.has(id);
    const next = new Set(plannedIds);
    if (adding) next.add(id); else next.delete(id);
    setPlannedIds(next);

    if (!user) {
      saveSet('rasvuyuro-planned', next);
    } else if (adding) {
      supabase.from('user_lists').upsert(
        { user_id: user.id, movie_id: id, list_type: 'planned' },
        { onConflict: 'user_id,movie_id,list_type' }
      );
    } else {
      supabase.from('user_lists').delete()
        .eq('user_id', user.id).eq('movie_id', id).eq('list_type', 'planned');
    }
  };

  return (
    <WatchedContext.Provider value={{ watchedIds, isWatched, toggleWatched, plannedIds, isPlanned, togglePlanned }}>
      {children}
    </WatchedContext.Provider>
  );
}

export function useWatched() {
  return useContext(WatchedContext);
}
