package middleware

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client
var ctx = context.Background()

// InitRedis sets up the Redis connection
func InitRedis(url string) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		log.Fatalf("Invalid Redis URL: %v", url)
	}
	RedisClient = redis.NewClient(opts)

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		log.Printf("Redis not available: %v (caching disabled)", err)
		RedisClient = nil
	} else {
		log.Println("Redis connected")
	}
}

// cache returns a Gin middleware that caches responses in redis
func Cache(ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if RedisClient == nil {
			c.Next()
			return
		}

		key := "cache:" + c.Request.URL.RequestURI()

		cached, err := RedisClient.Get(ctx, key).Bytes()
		if err == nil {
			log.Printf("Cache HIT: %s", key)
			c.Data(http.StatusOK, "application/json", cached)
			c.Abort()
			return
		}

		writer := newResponseCapture(c.Writer)
		c.Writer = writer
		c.Next()

		if writer.status == http.StatusOK && writer.body.Len() > 0 {
			RedisClient.Set(ctx, key, writer.body.Bytes(), ttl)
			log.Printf("Cache SET: %s (%v)", key, ttl)
		}
	}
}

type responseCapture struct {
	gin.ResponseWriter
	body   *bytes.Buffer
	status int
}

func newResponseCapture(w gin.ResponseWriter) *responseCapture {
	return &responseCapture{
		ResponseWriter: w,
		body:           &bytes.Buffer{},
		status:         http.StatusOK, // default to 200 instead of 0
	}
}

func (w *responseCapture) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *responseCapture) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}
