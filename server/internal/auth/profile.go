/*
profile.go provides user profile management features for a ride-sharing platform or similar system.

It defines the UserProfile struct and associated CRUD functions that interact with a relational database
using GORM. Each user can have a single profile associated with their unique user ID (UID), and the package
supports creating, retrieving, and updating these profiles.

Key Features:
  - UserProfile: stores personal and contact details such as name, email, address, and profile image.
  - ProfileUpdateParams: allows partial updates using pointer fields.
  - GetUserProfile: retrieves an existing profile by user UID.
  - CreateUserProfile: creates a new profile if it does not already exist.
  - UpdateUserProfile: selectively updates profile fields with non-nil values.

This package assumes that user existence validation is required before profile creation.
*/

package auth

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type UserProfile struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserUID      string    `json:"user_uid" gorm:"uniqueIndex;not null"`
	FullName     string    `json:"full_name"`
	MobileNumber string    `json:"mobile_number"`
	CountryCode  string    `json:"country_code" gorm:"default:+880"`
	Email        string    `json:"email"`
	Street       string    `json:"street"`
	City         string    `json:"city"`
	District     string    `json:"district"`
	ProfileImage string    `json:"profile_image"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type ProfileUpdateParams struct {
	FullName     *string `json:"full_name"`
	MobileNumber *string `json:"mobile_number"`
	CountryCode  *string `json:"country_code"`
	Email        *string `json:"email"`
	Street       *string `json:"street"`
	City         *string `json:"city"`
	District     *string `json:"district"`
	ProfileImage *string `json:"profile_image"`
}

// applyParamsToProfile updates a UserProfile with non-nil values from ProfileUpdateParams
func applyParamsToProfile(profile *UserProfile, params ProfileUpdateParams) {
	if params.FullName != nil {
		profile.FullName = *params.FullName
	}
	if params.MobileNumber != nil {
		profile.MobileNumber = *params.MobileNumber
	}
	if params.CountryCode != nil {
		profile.CountryCode = *params.CountryCode
	}
	if params.Email != nil {
		profile.Email = *params.Email
	}
	if params.Street != nil {
		profile.Street = *params.Street
	}
	if params.City != nil {
		profile.City = *params.City
	}
	if params.District != nil {
		profile.District = *params.District
	}
	if params.ProfileImage != nil {
		profile.ProfileImage = *params.ProfileImage
	}
}

func GetUserProfile(uid string) (*UserProfile, error) {
	db, err := storage.GetConnection()
	if err != nil {
		return nil, err
	}

	var profile UserProfile
	if err := db.Where("user_uid = ?", uid).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("profile not found")
		}
		return nil, err
	}
	return &profile, nil
}

func CreateUserProfile(uid string, params ProfileUpdateParams) (*UserProfile, error) {
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

	var existing UserProfile
	if err := db.Where("user_uid = ?", uid).First(&existing).Error; err == nil {
		return nil, errors.New("profile already exists for this user")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	profile := &UserProfile{UserUID: uid}
	applyParamsToProfile(profile, params)

	if err := db.Create(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func UpdateUserProfile(uid string, params ProfileUpdateParams) (*UserProfile, error) {
	db, err := storage.GetConnection()
	if err != nil {
		return nil, err
	}

	profile, err := GetUserProfile(uid)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if params.FullName != nil {
		updates["full_name"] = *params.FullName
	}
	if params.MobileNumber != nil {
		updates["mobile_number"] = *params.MobileNumber
	}
	if params.CountryCode != nil {
		updates["country_code"] = *params.CountryCode
	}
	if params.Email != nil {
		updates["email"] = *params.Email
	}
	if params.Street != nil {
		updates["street"] = *params.Street
	}
	if params.City != nil {
		updates["city"] = *params.City
	}
	if params.District != nil {
		updates["district"] = *params.District
	}
	if params.ProfileImage != nil {
		updates["profile_image"] = *params.ProfileImage
	}

	if len(updates) > 0 {
		if err := db.Model(profile).Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	return GetUserProfile(uid)
}
