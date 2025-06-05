package rides

import (
	"rideshare/internal/auth"
	"rideshare/internal/storage"
	"strconv"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

type RideRequest struct {
	ID     int `json:"id" gorm:"primaryKey"`
	User   auth.User
	UserID string `json:"user_id" gorm:"foreignKey"`
	Ride   RideOffer
	RideID uint `json:"ride_id" gorm:"foreignKey"`
	Status int  `json:"status"` // 0 -> none, -1 -> decline, +1 -> accept
}

func CreateRideRequest(c echo.Context, u *auth.User, app firebase.App) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)

	if err != nil {
		return err

	}
	var request RideRequest
	rideId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return err
	}
	request.RideID = int(rideId)
	request.UserID = u.ID
	request.Status = 0
	res := tx.Create(&request)
	if res.Error != nil {
		return res.Error
	}

	return c.JSON(201, map[string]string{
		"message": "created ride!",
	})
}
