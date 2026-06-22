package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func tmdbGet(path string, params map[string]string) ([]byte, error) {
	base := os.Getenv("TMDB_BASE_URL")
	token := os.Getenv("TMDB_API_TOKEN")

	req, err := http.NewRequest("GET", base+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	q := req.URL.Query()
	for k, v := range params {
		q.Set(k, v)
	}
	req.URL.RawQuery = q.Encode() //converts map into proper URL string like ?query=inception&page=1

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("TMDB returned %d", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}

// SearchMovies handles GET /api/movies/search?q=inception
func SearchMovies(c *gin.Context) {
	q := c.Query("q")
	log.Printf("SearchMovies called with q=%s", q)

	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q parameter is required"})
		return
	}
	if len(q) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query too long"})
		return
	}

	page := c.DefaultQuery("page", "1")
	body, err := tmdbGet("/search/movie", map[string]string{
		"query":         q,
		"page":          page,
		"include_adult": "false",
	})
	if err != nil {
		log.Printf("tmdbGet error: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach TMDB"})
		return
	}

	log.Printf("tmdbGet response length: %d bytes", len(body))

	var result any
	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("json.Unmarshal error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetMovieDetails handles GET /api/movies/:tmdbId
func GetMovieDetails(c *gin.Context) {
	id := c.Param("tmdbId")
	body, err := tmdbGet("/movie"+id, map[string]string{
		"append_to_response": "credits,similar",
	})

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach TMDB"})
		return
	}
	var result any
	json.Unmarshal(body, &result)
	c.JSON(http.StatusOK, result)
}

// GetSimilarMovies handles GET /api/movies/:tmdbId/similar
func GetSimilarMovies(c *gin.Context) {
	id := c.Param("tmdbId")
	body, err := tmdbGet("/movie/"+id+"/similar", nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach TMDB"})
		return
	}

	var result any
	json.Unmarshal(body, &result)
	c.JSON(http.StatusOK, result)
}
