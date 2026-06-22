package models

type WatchListItem struct {
	ID          int64    `json:"id"`
	TmdbID      int64    `json:"tmdb_id"`
	Title       string   `json:"title"`
	PosterPath  string   `json:"poster_path"`
	ReleaseYear string   `json:"release_year"`
	Genres      []string `json:"genres"`
	Overview    string   `json:"overview"`
	Watched     bool     `json:"watched"`
	Rating      *float64 `json:"rating"`
	Notes       string   `json:"notes"`
	DateAdded   string   `json:"date_added"`
	DateWatched *string  `json:"date_watched"`
}

type AddMovieRequest struct {
	TmdbID      int64    `json:"tmdb_id" binding:"required,min=1"`
	Title       string   `json:"title" binding:"required,max=200"`
	PosterPath  string   `json:"poster_path"`
	ReleaseYear string   `json:"release_year"`
	Genres      []string `json:"genres"`
	Overview    string   `json:"overview" binding:"max=200"`
}

type UpdateRequest struct {
	Watched *bool    `json:"watched"`
	Rating  *float64 `json:"rating" binding:"omitempty,min=0,max=10"`
	Notes   *string  `json:"notes" binding:"omitempty,max=1000"`
}
