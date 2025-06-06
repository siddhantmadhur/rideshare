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
	RideID int `json:"ride_id" gorm:"foreignKey"`
	Status int `json:"status"` // 0 -> none, -1 -> decline, +1 -> accept
}

// -> GET /rides/requests/:id/pending
func GetAllRideRequest(c echo.Context, u *auth.User, app *firebase.App) error {
	rideId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return err
	}
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)

	query := `select ride_requests.*, users.display_name, users.description, ride_requests.id as request_id from ride_requests
		inner join ride_offers
		on ride_offers.id = ride_requests.ride_id
		left join users
		on ride_requests.user_id = users.id
		where ride_id = ? AND ride_offers.user_id = ?;`

	var request []struct {
		DisplayName string `json:"display_name"`
		Description string `json:"description"`
		UserID      string `json:"user_id"`
		Status      int    `json:"status"`
		RequestId   int    `json:"request_id"`
	}
	err = tx.Raw(query, rideId, u.ID).Scan(&request).Error
	if err != nil {
		return err
	}
	return c.JSON(200, request)
}

func CreateRideRequest(c echo.Context, u *auth.User, app *firebase.App) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)

	if err != nil {
		return err

	}
	var request RideRequest
	request.RideID, err = strconv.Atoi(c.Param("id"))
	if err != nil {
		return err
	}
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

func AcceptRideRequest(c echo.Context, u *auth.User, app *firebase.App) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)

	if err != nil {
		return err
	}

	rideId, err := strconv.Atoi(c.Param("ride_id"))
	if err != nil {
		return err
	}
	requestId, err := strconv.Atoi(c.Param("request_id"))
	if err != nil {
		return err
	}

	query := `with t as (
			select ride_requests.id as request_id, ride_offers.id as offer_id, ride_offers.user_id as owner_id
			from ride_requests
			inner join ride_offers
			on ride_requests.ride_id = ride_offers.id
		)
		update ride_requests
		set status = 1
		from t
		where id = ? and offer_id = ? and owner_id = ?;`

	err = tx.Exec(query, requestId, rideId, u.ID).Error
	if err != nil {
		return err
	}
	return c.JSON(200, map[string]string{
		"message": "accepted ride request!",
	})
}

func DeclineRideRequest(c echo.Context, u *auth.User, app *firebase.App) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return err
	}

	rideId, err := strconv.Atoi(c.Param("ride_id"))
	if err != nil {
		return err
	}
	requestId, err := strconv.Atoi(c.Param("request_id"))
	if err != nil {
		return err
	}

	query := `with t as (
			select ride_requests.id as request_id, ride_offers.id as offer_id, ride_offers.user_id as owner_id
			from ride_requests
			inner join ride_offers
			on ride_requests.ride_id = ride_offers.id
		)
		update ride_requests
		set status = -1
		from t
		where id = ? and offer_id = ? and owner_id = ?;`

	err = tx.Exec(query, requestId, rideId, u.ID).Error
	if err != nil {
		return err
	}
	return c.JSON(200, map[string]string{
		"message": "accepted ride request!",
	})
}

func DeleteRideRequest(c echo.Context, u *auth.User, app *firebase.App) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return err
	}

	var request RideRequest
	RequestId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return err
	}

	res := tx.Where("id = ?", RequestId).Delete(&request)
	if res.Error != nil {
		return res.Error
	}

	return c.JSON(204, map[string]string{"message": "deleted ride request"})
}
