import { useState, useCallback, useRef } from 'react';
import { searchMovies } from '../services/api';
import MovieCard from './MovieCard';

export default function MovieSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchMovies(val);
        setResults(data.results || []);
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      />
      {loading && <p style={{ color: '#888' }}>Searching...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length === 0 && query && !loading && (
        <p style={{ color: '#888' }}>No results found for "{query}"</p>
      )}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 16,
      }}>
        {results.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}