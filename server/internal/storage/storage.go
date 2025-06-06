package storage

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func GetConnection() (*gorm.DB, error) {
	url := "postgres://%s:%s@%s:%d/%s"

	var (
		username string = "postgres"
		password string = "mysecretpassword"
		hostname string = "localhost"
		port     int    = 5432
		dbname   string = "postgres"
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
