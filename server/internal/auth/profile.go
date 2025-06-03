package auth

import (
	"errors"
	"rideshare/internal/storage"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email" gorm:"unique"`
	Country     string    `json:"country"`
	Description string    `json:"description"`
	Interests   []string  `json:"interests"`
	Hobbies     []string  `json:"Hobbies"` 			
	DateOfBirth time.Time `json:"date_of_birth"`        
	Gender      string    `json:"gender"`
	Pronouns    string    `json:"pronouns"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func GetUserProfile(uid string) (*User, error) {
	db, err := storage.GetConnection()
	if err != nil {
		return nil, err
	}

	var profile User
	if err := db.Where("id = ?", uid).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("profile not found")
		}
		return nil, err
	}
	return &profile, nil
}


// Returns only the ~Firebase~ user 
func CreateUserProfile(uid string, profile *User) (*User, error) {
	db, err := storage.GetConnection()
	if err != nil {
		return nil, err
	}

	var user User
	if err := db.Where("uid = ?", uid).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	var existing User
	if err := db.Where("id = ?", uid).First(&existing).Error; err == nil {
		return nil, errors.New("profile already exists for this user")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if err := db.Create(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func UpdateUserProfile(uid string, updatedProfile *User) (*User, error) {
	db, err := storage.GetConnection()
	if err != nil {
		return nil, err
	}

	if err := db.Model(&User{}).Where("id = ?", uid).Updates(updatedProfile).Error; err != nil {
		return nil, err
	}
	return GetUserProfile(uid)
}

func Check
