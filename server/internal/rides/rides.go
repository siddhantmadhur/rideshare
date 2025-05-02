package rides

import (
	"rideshare/internal/auth"
	"rideshare/internal/storage"
	"time"

	"gorm.io/gorm"
)

type RideOffer struct {
	gorm.Model
	Dropoff   string    `json:"dropoff" gorm:"not null"`
	Timestamp time.Time `json:"timestamp" gorm:"not null"`
	Notes     string    `json:"notes"`
	User      auth.User `json:"-"`
	UserID    string    `json:"user_id" gorm:"unique;not null"`
	Pickup    string    `json:"pickup" gorm:"not null"`
}

// Create Ride Offer from the Driver
func CreateRideOffer(r *RideOffer) error {
	tx, err := storage.GetConnection()
	if err != nil {
		return err
	}

	res := tx.Create(r)

	return res.Error
}
