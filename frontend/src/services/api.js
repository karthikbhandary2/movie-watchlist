import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// --- Movies (TMDB proxy) ---
export const searchMovies = (query, page = 1) =>
  api.get('/movies/search', { params: { q: query, page } }).then(r => r.data);

export const getMovieDetails = (tmdbId) =>
  api.get(`/movies/${tmdbId}`).then(r => r.data);

export const getSimilarMovies = (tmdbId) =>
  api.get(`/movies/${tmdbId}/similar`).then(r => r.data);

// --- Watchlist (CRUD) ---
export const getWatchlist = (params = {}) =>
  api.get('/watchlist', { params }).then(r => r.data);

export const addToWatchlist = (movieData) =>
  api.post('/watchlist', movieData).then(r => r.data);

export const updateWatchlistItem = (id, updates) =>
  api.patch(`/watchlist/${id}`, updates).then(r => r.data);

export const removeFromWatchlist = (id) =>
  api.delete(`/watchlist/${id}`).then(r => r.data);