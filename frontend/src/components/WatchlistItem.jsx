import { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import RatingStars from './RatingStars';

const IMG_BASE = 'https://image.tmdb.org/t/p/w200';

export default function WatchlistItem({ item }) {
  const { markWatched, removeMovie } = useWatchlist();
  const [rating, setRating] = useState(item.rating || 0);
  const [notes, setNotes] = useState(item.notes || '');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMarkWatched() {
    setLoading(true);
    try {
      await markWatched(item.id, rating, notes);
      setShowForm(false);
    } catch (err) {
      alert('Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      padding: 16,
      borderBottom: '1px solid #eee',
      alignItems: 'flex-start',
    }}>
      {item.poster_path ? (
        <img
          src={`${IMG_BASE}${item.poster_path}`}
          alt={item.title}
          width={80}
          style={{ borderRadius: 4, flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 80, height: 120,
          background: '#eee',
          borderRadius: 4,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#999',
        }}>
          No Image
        </div>
      )}

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>
          {item.title}
          {item.release_year && (
            <span style={{ fontWeight: 'normal', color: '#888', fontSize: 14 }}>
              {' '}({item.release_year})
            </span>
          )}
        </h3>
        <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#888' }}>
          Added: {new Date(item.date_added).toLocaleDateString()}
        </p>

        {item.watched ? (
          <div>
            <span style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 12,
            }}>
              ✓ Watched
            </span>
            {item.date_watched && (
              <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                {new Date(item.date_watched).toLocaleDateString()}
              </span>
            )}
            <div style={{ marginTop: 8 }}>
              <RatingStars value={item.rating || 0} readOnly />
            </div>
            {item.notes && (
              <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                "{item.notes}"
              </p>
            )}
          </div>
        ) : (
          <div>
            <span style={{
              background: '#fff3e0',
              color: '#e65100',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 12,
            }}>
              ⏳ Unwatched
            </span>
            {showForm ? (
              <div style={{ marginTop: 12 }}>
                <RatingStars value={rating} onChange={setRating} />
                <textarea
                  placeholder="Add notes (optional)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 13,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  rows={3}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={handleMarkWatched}
                    disabled={loading}
                    style={{
                      padding: '6px 16px',
                      background: '#2e7d32',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: loading ? 'default' : 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      padding: '6px 16px',
                      background: '#eee',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  background: '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'block',
                }}
              >
                Mark as Watched
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => removeMovie(item.id)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          color: '#ccc',
          flexShrink: 0,
        }}
        title="Remove from watchlist"
      >
        🗑
      </button>
    </div>
  );
}