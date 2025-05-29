package rating

import (
	"errors"
	"rideshare/internal/storage"

	"gorm.io/gorm"
)

type Rating struct{
	gorm.Model
    ReviewerId 			string `json:"reviewer_id"`
    RecipientId 		string `json:"recipient_id"`
	IsReviewerDriver 	bool   `json:"is_reviewer_driver"` // true if reviewer is a driver, false if passenger
    RideId 				int	   `json:"ride_id"`
    Rating				int	   `json:"rating"` // 1-10
    Description 		string `json:"description"` // optional
}

func CreateReview(r *Rating) error {
	db, err := storage.GetConnection()
	if err != nil {
		return err
	}
	if r.Rating < 1 || r.Rating > 10 {
		return errors.New("rating should be between 1 and 10")
	}

	res := db.Create(r)
	return res.Error
}

func DeleteReview (RideID int) error{
	db, err := storage.GetConnection()
	if err != nil{
		return err
	}

	res := db.Where("ride_id = ?", RideID).Delete(&Rating{})
	return res.Error
}

func ListReviewsByDriver (ID string) ([] Rating, error){
	db, err := storage.GetConnection()
	if err != nil{
		return nil, err
	}

	var ratings []Rating
	res := db.Where("recipient_id = ? AND is_reviewer_driver = ?", ID, true).Find(&ratings)
	return ratings, res.Error
}

func ListReviewsByPassenger (ID string) ([] Rating, error){
	db, err := storage.GetConnection()
	if err != nil{
		return nil, err
	}

	var ratings []Rating
	res := db.Where("recipient_id = ? AND is_reviewr_driver", ID, false).Find(&ratings)
	return ratings, res.Error
}

func GetAverageRating (ID string) (float64, error){
	db, err := storage.GetConnection()
	if err != nil{
		return 0, err
	}

	var average float64
	res := db.Model(&Rating{}).Where("recipient_id = ?", ID).Select("AVG(rating)").Scan(&average)
	if res.Error != nil{
		return 0, res.Error
	}
	if average == 0{
		return 0, errors.New("no ratings found for this user")
	}
	return average, nil
}
