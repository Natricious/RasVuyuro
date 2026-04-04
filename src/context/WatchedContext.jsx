import { createContext, useContext, useState } from 'react';

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

const WatchedContext = createContext(null);

export function WatchedProvider({ children }) {
  const [watchedIds, setWatchedIds] = useState(() => loadSet('rasvuyuro-watched'));
  const [plannedIds, setPlannedIds] = useState(() => loadSet('rasvuyuro-planned'));

  const isWatched = (id) => watchedIds.has(id);
  const isPlanned = (id) => plannedIds.has(id);

  const toggleWatched = (id) => {
    setWatchedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Auto-remove from planned when marked as watched
        setPlannedIds(prevP => {
          if (!prevP.has(id)) return prevP;
          const nextP = new Set(prevP);
          nextP.delete(id);
          saveSet('rasvuyuro-planned', nextP);
          return nextP;
        });
      }
      saveSet('rasvuyuro-watched', next);
      return next;
    });
  };

  const togglePlanned = (id) => {
    setPlannedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveSet('rasvuyuro-planned', next);
      return next;
    });
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
