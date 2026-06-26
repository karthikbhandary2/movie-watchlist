import { useWatchlist } from '../context/WatchlistContext';
import FilterSort from '../components/FilterSort';
import WatchlistItem from '../components/WatchlistItem';

export default function WatchlistPage() {
  const { items, loading, error } = useWatchlist();

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>🎬 My Watchlist ({items.length})</h1>
      <FilterSort />
      {loading && <p style={{ color: '#888' }}>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {items.length === 0 && !loading && (
        <p style={{ color: '#888' }}>
          Your watchlist is empty. Search for movies to add!
        </p>
      )}
      <div>
        {items.map(item => (
          <WatchlistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}