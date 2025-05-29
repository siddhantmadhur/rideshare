package auth

import (
	"rideshare/internal/storage"
)

type User struct {
	ID          string `json:"uid" gorm:"primaryKey"`
	DisplayName string `json:"display_name" gorm:"not null"`
	Age         int    `json:"age" gorm:"not null"`
}

func CreateUser(u *User) error {
	db, err := storage.GetConnection()
	if err != nil {
		return err
	}

	return db.FirstOrCreate(u, "id = ?", u.ID).Error
}
