import { useWatchlist } from '../context/WatchlistContext';

const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

export default function MovieCard({ movie }) {
  const { addMovie, isInWatchlist } = useWatchlist();
  const alreadyAdded = isInWatchlist(movie.id);

  async function handleAdd() {
    try {
      await addMovie({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
        release_year: movie.release_date?.slice(0, 4) || '',
        genres: movie.genre_ids?.map(String) ?? [],
        overview: movie.overview || '',
      });
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Already in watchlist');
      }
    }
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      overflow: 'hidden',
      width: 180,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {movie.poster_path ? (
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt={movie.title}
          loading="lazy"
          width={180}
          height={270}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: 180, height: 270,
          background: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          No Image
        </div>
      )}
      <div style={{ padding: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>{movie.title}</h3>
        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
          {movie.release_date?.slice(0, 4)}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
          ⭐ {movie.vote_average?.toFixed(1)}
        </p>
        <button
          onClick={handleAdd}
          disabled={alreadyAdded}
          style={{
            marginTop: 'auto',
            padding: '6px 8px',
            background: alreadyAdded ? '#ccc' : '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: alreadyAdded ? 'default' : 'pointer',
            fontSize: 12,
          }}
        >
          {alreadyAdded ? '✓ In Watchlist' : '+ Add'}
        </button>
      </div>
    </div>
  );
}