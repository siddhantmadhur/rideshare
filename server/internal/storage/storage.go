package storage

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func GetEnvOrDefault(key string, defaultVal string) string {
	val := os.Getenv(key)
	if len(val) == 0 {
		return defaultVal
	}
	return val
}

func GetConnection() (*gorm.DB, error) {
	url := "postgres://%s:%s@%s:%d/%s"

	var (
		username string = GetEnvOrDefault("POSTGRES_USERNAME", "postgres")
		password string = GetEnvOrDefault("POSTGRES_PASSWORD", "mysecretpassword")
		hostname string = GetEnvOrDefault("POSTGRES_HOSTNAME", "localhost")
		port     int    = 5432
		dbname   string = GetEnvOrDefault("POSTGRES_DBNAME", "postgres")
	)
	dsn := fmt.Sprintf(url, username, password, hostname, port, dbname)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return db, err
}

func CloseConnection(tx *gorm.DB) error {
	db, err := tx.DB()
	if err != nil {
		return err
	}
	return db.Close()
}
