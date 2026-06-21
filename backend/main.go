package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/karthikbhandary2/watchlist/db"
	"github.com/karthikbhandary2/watchlist/handlers"
	"github.com/karthikbhandary2/watchlist/middleware"
	"golang.org/x/time/rate"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading env vars directly")
	}

	// Init DB
	db.Init("./watchlist.db")

	// Init Redis (graceful skips if unavailable)
	middleware.InitRedis(os.Getenv("REDIS_URL"))

	// Create rate limiters
	// General: 10 req/sec, burst of 30
	generalLimiter := middleware.NewRateLimiter(rate.Limit(10), 30)
	// search: 2 req/sec, burst of 5
	searchLimiter := middleware.NewRateLimiter(rate.Limit(10), 30)

	r := gin.Default()

	// CORS for React
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Apply general rate limit to all routes
	r.Use(generalLimiter.Middleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")

	// Movie routes (TMDB proxy)
	movies := api.Group("/movies")
	{
		movies.GET("/search",
			searchLimiter.Middleware(),
			middleware.Cache(30*time.Minute),
			handlers.SearchMovies,
		)
		movies.GET("/:tmdbId",
			middleware.Cache(24*time.Hour),
			handlers.GetMovieDetails,
		)
		movies.GET("/:tmdbId/similar",
			middleware.Cache(time.Hour),
			handlers.GetSimilarMovies,
		)
	}

	// watchlist CRUD routes
	watchlist := api.Group("watchlist")
	{
		watchlist.GET("", handlers.GetWatchlist)
		watchlist.POST("", handlers.AddToWatchlist)
		watchlist.PATCH("/:id", handlers.UpdateWatchlistItem)
		watchlist.DELETE("/:id", handlers.DeleteFromWatchlist)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("Server running on http://localhost:%s", port)
	r.Run(":" + port)
}
