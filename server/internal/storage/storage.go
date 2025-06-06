package storage

import (
	"fmt"
	"os"
	"strconv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func GetConnection() (*gorm.DB, error) {
	url := "postgres://%s:%s@%s:%d/%s"

	// Get environment variables with defaults
	username := getEnv("DB_USERNAME", "postgres")
	password := getEnv("DB_PASSWORD", "mysecretpassword")
	hostname := getEnv("DB_HOSTNAME", "localhost")
	portStr := getEnv("DB_PORT", "5432")
	dbname := getEnv("DB_NAME", "postgres")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 5432 // fallback to default
	}

	dsn := fmt.Sprintf(url, username, password, hostname, port, dbname)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return db, err
}

// Helper function to get environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func CloseConnection(tx *gorm.DB) error {
	db, err := tx.DB()
	if err != nil {
		return err
	}
	return db.Close()
}
