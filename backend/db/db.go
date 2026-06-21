package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/karthikbhandary2/watchlist/models"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// Init opens the sqlite file and creates tables
func Init(path string) {
	var err error
	DB, err = sql.Open("sqlite3", path+"?_journal_mode=WAL")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	createTables()
	log.Println("Database connected:", path)
}

// creates table
func createTables() {
	query := `
	CREATE TABLE IF NOT EXISTS watchlist (
		id           INTEGER PRIMARY KEY AUTOINCREMENT,
        tmdb_id      INTEGER NOT NULL UNIQUE,
        title        TEXT NOT NULL,
        poster_path  TEXT DEFAULT '',
        release_year TEXT DEFAULT '',
        genres       TEXT DEFAULT '[]',
        overview     TEXT DEFAULT '',
        watched      INTEGER DEFAULT 0,
        rating       REAL,
        notes        TEXT DEFAULT '',
        date_added   TEXT DEFAULT (datetime('now')),
        date_watched TEXT
	);
	`
	if _, err := DB.Query(query); err != nil {
		log.Fatalf("Failed to create table %v", err)
	}
}

func GetAll(filter, sort, order string) ([]models.WatchListItem, error) {
	//Whitelist sort cols to prevent SQL injection
	allowed := map[string]bool{
		"date_added": true, "rating": true,
		"title": true, "date_watched": true,
	}
	// if the sort value is not in the allowed map set it to `date_added`
	if !allowed[sort] {
		sort = "date_added"
	}
	// Anything that is not `asc` set it to desc
	if order != "asc" {
		order = "desc"
	}

	query := "SELECT * FROM watchlist"
	args := []any{}

	switch filter {
	case "watched":
		query += "WHERE watched = 1"
	case "unwatched":
		query += "WHERE watched = 0"
	default:
		// return everything
	}

	// order the output
	query += fmt.Sprintf(" ORDER BY %s %s", sort, order)

	//query
	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}

	// release after the function returns
	defer rows.Close()

	var items []models.WatchListItem
	for rows.Next() {
		var item models.WatchListItem
		var genresJSON string
		var watchedInt int

		err := rows.Scan(
			&item.ID,
			&item.TmdbID,
			&item.Title,
			&item.PosterPath,
			&item.ReleaseYear,
			&genresJSON,
			&item.Overview,
			&watchedInt,
			&item.Rating,
			&item.Notes,
			&item.DateAdded,
			&item.DateWatched,
		)
		if err != nil {
			return nil, err
		}

		//convert stored JSON string -> []string
		json.Unmarshal([]byte(genresJSON), &item.Genres)
		//if true item.Watched is set to 1 otherwise 0
		item.Watched = watchedInt == 1

		items = append(items, item)
	}
	if items == nil {
		items = []models.WatchListItem{} // return [] not null in JSON
	}
	return items, nil
}

// Insert adds a new movie to the watchlist
func Insert(req models.AddMovieRequest) (int64, error) {
	genresJSON, _ := json.Marshal(req.Genres)
	result, err := DB.Exec(`
        INSERT INTO watchlist (
		tmdb_id, 
		title, 
		poster_path, 
		release_year, 
		genres, 
		overview
		) VALUES (?, ?, ?, ?, ?, ?)`,
        req.TmdbID, 
		req.Title, 
		req.PosterPath,
        req.ReleaseYear, 
		string(genresJSON), 
		req.Overview,
	)

	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

//Update modifies rating, notes, or watched status
func Update(id int64, req models.UpdateRequest) (int64, error) {
	if req.Watched == nil && req.Rating == nil && req.Notes == nil {
		return 0, fmt.Errorf("no fields to update")
	}

	setClauses := []string{}
	args := []any{}

	if req.Rating != nil {
		setClauses = append(setClauses, "rating = ?")
		args = append(args, *req.Rating)
	}
	if req.Notes != nil {
		setClauses = append(setClauses, "notes = ?")
		args = append(args, *req.Notes)
	}
	if req.Watched != nil {
		setClauses = append(setClauses, "watched = ?")
		args = append(args, boolToInt(*req.Watched))
		if *req.Watched {
			setClauses = append(setClauses, "date_watched = ?")
			args = append(args, time.Now().UTC().Format(time.RFC3339))
		}else {
			setClauses = append(setClauses, "date_watched = NULL")
		}
	}

	query := "UPDATE watchlist SET "
	for i, clause := range setClauses {
		if i > 0 {
			query += ", "
		}
		query += clause
	}
	query += " WHERE id = ?"
	args = append(args, id)

	result, err := DB.Exec(query, args...)
    if err != nil {
        return 0, err
    }
    affected, _ := result.RowsAffected()
    return affected, nil
}

func Delete(id int64) (int64, error) {
	result, err := DB.Exec("DELETE FROM watchlist WHERE id = ?", id)
	if err != nil {
		return 0, err
	}
	affected, _ := result.RowsAffected()
	return affected, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
