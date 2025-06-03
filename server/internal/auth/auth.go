package auth

import (
	"rideshare/internal/storage"
)

func CreateUser(u *User) error {
	db, err := storage.GetConnection()
	if err != nil {
		return err
	}

	return db.FirstOrCreate(u, "id = ?", u.ID).Error
}
