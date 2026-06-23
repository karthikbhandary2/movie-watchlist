# 🎬 Movie Watchlist

A full-stack movie watchlist app powered by the [TMDB API](https://www.themoviedb.org/). Search for films, save them to your personal watchlist, mark them as watched, rate them, and leave notes — all backed by a Go API with SQLite persistence and optional Redis caching.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Go, Gin |
| Database | SQLite (WAL mode) |
| Cache | Redis (optional, graceful degradation) |
| Movie Data | TMDB API |

---

## Features

- **Movie Search** — Search TMDB by title with paginated results
- **Movie Details** — Fetch full details including cast/credits and similar films
- **Watchlist CRUD** — Add, view, update, and remove movies
- **Watched Tracking** — Mark movies as watched/unwatched with automatic timestamp
- **Ratings & Notes** — Rate movies (0–10) and write personal notes
- **Filter & Sort** — Filter by watched/unwatched; sort by date added, rating, title, or date watched
- **Redis Caching** — TMDB search results cached for 30 min, details for 24 h (skipped gracefully if Redis is unavailable)
- **Rate Limiting** — Per-IP rate limiting (10 req/s general, burst of 30; tighter limits on search)

---

## Project Structure

```
movie-watchlist/
├── backend/
│   ├── main.go             # Server setup, routing, middleware wiring
│   ├── go.mod / go.sum
│   ├── handlers/
│   │   ├── movies.go       # TMDB proxy handlers (search, details, similar)
│   │   └── watchlist.go    # Watchlist CRUD handlers
│   ├── middleware/
│   │   ├── cache.go        # Redis response caching middleware
│   │   └── ratelimit.go    # Per-IP token-bucket rate limiter
│   ├── models/
│   │   └── models.go       # WatchListItem, AddMovieRequest, UpdateRequest
│   └── db/
│       └── db.go           # SQLite init, table creation, query helpers
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- A [TMDB API token](https://developer.themoviedb.org/docs/getting-started) (Bearer token)
- Redis (optional — caching is skipped if unavailable)

### 1. Clone the repo

```bash
git clone https://github.com/karthikbhandary2/movie-watchlist.git
cd movie-watchlist
```

### 2. Configure the backend

Create a `.env` file inside the `backend/` directory:

```env
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_API_TOKEN=your_tmdb_bearer_token_here
REDIS_URL=redis://localhost:6379   # optional
PORT=3001                          # optional, defaults to 3001
```

### 3. Run the backend

```bash
cd backend
go mod download
go run main.go
```

The API will be available at `http://localhost:3001`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

## API Reference

### Movies (TMDB Proxy)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies/search?q=<title>&page=<n>` | Search movies by title |
| `GET` | `/api/movies/:tmdbId` | Get movie details (includes credits & similar) |
| `GET` | `/api/movies/:tmdbId/similar` | Get similar movies |

### Watchlist

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/watchlist` | List all watchlist items |
| `POST` | `/api/watchlist` | Add a movie to the watchlist |
| `PATCH` | `/api/watchlist/:id` | Update watched status, rating, or notes |
| `DELETE` | `/api/watchlist/:id` | Remove a movie from the watchlist |

#### GET `/api/watchlist` query params

| Param | Values | Default |
|---|---|---|
| `filter` | `all`, `watched`, `unwatched` | `all` |
| `sort` | `date_added`, `rating`, `title`, `date_watched` | `date_added` |
| `order` | `asc`, `desc` | `desc` |

#### POST `/api/watchlist` body

```json
{
  "tmdb_id": 550,
  "title": "Fight Club",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "release_year": "1999",
  "genres": ["Drama", "Thriller"],
  "overview": "An insomniac office worker..."
}
```

#### PATCH `/api/watchlist/:id` body (all fields optional)

```json
{
  "watched": true,
  "rating": 9.5,
  "notes": "One of the best films ever made."
}
```

### Health Check

```
GET /health  →  { "status": "ok" }
```

---

## Database Schema

```sql
CREATE TABLE watchlist (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id      INTEGER NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  poster_path  TEXT DEFAULT '',
  release_year TEXT DEFAULT '',
  genres       TEXT DEFAULT '[]',    -- JSON array
  overview     TEXT DEFAULT '',
  watched      INTEGER DEFAULT 0,    -- 0 = unwatched, 1 = watched
  rating       REAL,                 -- 0.0 – 10.0
  notes        TEXT DEFAULT '',
  date_added   TEXT DEFAULT (datetime('now')),
  date_watched TEXT
);
```

---

## License

MIT
