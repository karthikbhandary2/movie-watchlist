package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/karthikbhandary2/watchlist/db"
	"github.com/karthikbhandary2/watchlist/models"
)

// GetWatchlist handles GET /api/watchlist?filter=watched&sort=rating&order=desc
func GetWatchlist(c *gin.Context) {
	filter := c.DefaultQuery("filter", "all")
	sort := c.DefaultQuery("sort", "date_added")
	order := c.DefaultQuery("order", "desc")

	log.Printf("GetWatchlist called: filter=%s sort=%s order=%s", filter, sort, order) // add this

	items, err := db.GetAll(filter, sort, order)
	if err != nil {
		log.Printf("GetAll returned error: %v", err) // add this
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	log.Printf("GetAll returned %d items", len(items)) // add this
	c.JSON(http.StatusOK, items)
}

// AddToWatchlist handles POST /api/watchlist
func AddToWatchlist(c *gin.Context) {
	var req models.AddMovieRequest

	// ShouldBindJSON validates the body against struct tags
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Basic sanitization: trim strings
	req.Title = strings.TrimSpace(req.Title)
	req.Overview = strings.TrimSpace(req.Overview)

	id, err := db.Insert(req)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			c.JSON(http.StatusConflict, gin.H{"error": "Movie already in watchlist"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add movie"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Added to watchlist"})
}

// UpdateWatchlistItem handles PATCH /api/watchlist/:id
func UpdateWatchlistItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	affected, err := db.Update(id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successfully"})
}

// DeleteFromWatchlist handles DELETE /api/watchlist/:id
func DeleteFromWatchlist(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	affected, err := db.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from watchlist"})
}
