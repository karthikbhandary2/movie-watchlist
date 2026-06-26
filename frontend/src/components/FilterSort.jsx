import { useWatchlist } from '../context/WatchlistContext';

export default function FilterSort() {
  const { filter, sort, setFilter, setSort } = useWatchlist();

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #ddd',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        <option value="all">All Movies</option>
        <option value="watched">Watched</option>
        <option value="unwatched">Unwatched</option>
      </select>

      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #ddd',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        <option value="date_added">Date Added</option>
        <option value="rating">My Rating</option>
        <option value="title">Title (A-Z)</option>
        <option value="date_watched">Date Watched</option>
      </select>
    </div>
  );
}