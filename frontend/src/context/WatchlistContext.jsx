import { createContext, useContext, useReducer, useEffect } from 'react';
import * as api from '../services/api';

const WatchlistContext = createContext(null);

const ACTIONS = {
  SET_LIST: 'SET_LIST',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

function watchlistReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LIST:
      return { ...state, items: action.payload, loading: false };
    case ACTIONS.ADD_ITEM:
      return { ...state, items: [action.payload, ...state.items] };
    case ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case ACTIONS.SET_FILTER:
      return { ...state, filter: action.payload };
    case ACTIONS.SET_SORT:
      return { ...state, sort: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const initialState = {
  items: [],
  filter: 'all',
  sort: 'date_added',
  loading: false,
  error: null,
};

export function WatchlistProvider({ children }) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);

  useEffect(() => {
    async function fetchWatchlist() {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const params = {};
        if (state.filter !== 'all') params.filter = state.filter;
        params.sort = state.sort;
        const data = await api.getWatchlist(params);
        dispatch({ type: ACTIONS.SET_LIST, payload: data });
      } catch (err) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      }
    }
    fetchWatchlist();
  }, [state.filter, state.sort]);

  async function addMovie(movieData) {
    const result = await api.addToWatchlist(movieData);
    dispatch({ type: ACTIONS.ADD_ITEM, payload: { ...movieData, id: result.id } });
  }

  async function markWatched(id, rating, notes) {
    await api.updateWatchlistItem(id, { watched: true, rating, notes });
    dispatch({ type: ACTIONS.UPDATE_ITEM, payload: { id, watched: true, rating, notes } });
  }

  async function removeMovie(id) {
    await api.removeFromWatchlist(id);
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });
  }

  function setFilter(filter) {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter });
  }

  function setSort(sort) {
    dispatch({ type: ACTIONS.SET_SORT, payload: sort });
  }

  function isInWatchlist(tmdbId) {
    return state.items.some(item => item.tmdb_id === tmdbId);
  }

  return (
    <WatchlistContext.Provider
      value={{ ...state, addMovie, markWatched, removeMovie, setFilter, setSort, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}