package rides

import (
	"rideshare/internal/auth"
	"rideshare/internal/storage"
	"time"

	"gorm.io/gorm"
)

type Location struct {
	Id    string `json:"id"`
	Title string `json:"title"`
}

type RideOffer struct {
	gorm.Model
	ID          int       `json:"id"`
	Dropoff     string    `json:"dropoff" gorm:"not null;type:json"`
	Pickup      string    `json:"pickup" gorm:"not null;type:json"`
	Timestamp   time.Time `json:"timestamp" gorm:"not null"`
	Notes       string    `json:"notes"`
	User        auth.User `json:"-"`
	UserID      string    `json:"user_id" gorm:"not null"` // took out unique so a uid can have more than 1 ride
	HasCar      bool      `json:"has_car" gorm:"not null"`
	SplitGas    bool      `json:"split_gas" gorm:"not null"`
	SplitUber   bool      `json:"split_uber" gorm:"not null"`
	Passengers  string    `json:"passengers"`
	Date        string    `json:"date"`
	Time        string    `json:"time"`
	CarModel    string    `json:"car_model"`
	Environment string    `json:"environment"`
}

// Create Ride Offer from the Driver
func CreateRideOffer(r *RideOffer) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return err
	}

	res := tx.Create(r)

	return res.Error
}

func UpdateRideOffer(r *RideOffer) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return err
	}
	res := tx.Model(&RideOffer{}).Where("id = ?", r.ID).Updates(r)
	return res.Error
}

func DeleteRideOffer(id uint) error {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return err
	}
	res := tx.Delete(&RideOffer{}, id)
	return res.Error
}

type UserRide struct {
	RideOffer
	DisplayName string `json:"display_name"`
}

func GetAllRides() ([]UserRide, error) {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return nil, err
	}
	var rides []UserRide
	err = tx.Table("ride_offers").Select("ride_offers.*, users.display_name").Where("ride_offers.deleted_at IS NULL").Joins("left join users on users.id = ride_offers.user_id").Scan(&rides).Error
	return rides, err
}

func GetAllUserRides(uid string) ([]RideOffer, error) {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return nil, err
	}
	var rides []RideOffer
	res := tx.Where("user_id = ?", uid).Find(&rides)
	return rides, res.Error
}

func GetRideByID(id uint) (RideOffer, error) {
	tx, err := storage.GetConnection()
	defer storage.CloseConnection(tx)
	if err != nil {
		return RideOffer{}, err
	}
	var ride RideOffer
	err = tx.First(&ride, "id = ?", id).Error
	return ride, err

}
