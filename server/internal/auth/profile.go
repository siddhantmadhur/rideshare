package auth

import (
	"errors"
	"net/http"
	"rideshare/internal/storage"
	"time"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type User struct {
	ID          string         `json:"id" gorm:"primaryKey"`
	DisplayName string         `json:"display_name"`
	Email       string         `json:"email" gorm:"unique"`
	Description string         `json:"description"`
	Interests   pq.StringArray `json:"interests" gorm:"type:text[]"`
	DateOfBirth time.Time      `json:"date_of_birth"`
	Gender      string         `json:"gender"`
	Pronouns    string         `json:"pronouns"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
}

func GetUserProfile(uid string) (*User, error) {
	db, err := storage.GetConnection()
	defer storage.CloseConnection(db)
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

func CreateUserProfile(uid string, profile *User) (*User, error) {
	db, err := storage.GetConnection()
	defer storage.CloseConnection(db)
	if err != nil {
		return nil, err
	}

	profile.ID = uid
	if err := db.Table("users").Create(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func UpdateUserProfile(uid string, updatedProfile *User) (*User, error) {
	db, err := storage.GetConnection()
	defer storage.CloseConnection(db)
	if err != nil {
		return nil, err
	}

	if err := db.Model(&User{}).Where("id = ?", uid).Updates(map[string]interface{}{
		"display_name":  updatedProfile.DisplayName,
		"description":   updatedProfile.Description,
		"interests":     updatedProfile.Interests,
		"date_of_birth": updatedProfile.DateOfBirth,
		"gender":        updatedProfile.Gender,
		"pronouns":      updatedProfile.Pronouns,
	}).Error; err != nil {
		return nil, err
	}

	return GetUserProfile(uid)
}

func GetUserProfileRoute(c echo.Context, app *firebase.App) error {
	u, err := GetUserFromContext(c, app)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": err.Error(),
		})
	}

	profile, err := GetUserProfile(u.UID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, profile)
}

func CreateProfileRoute(c echo.Context, app *firebase.App) error {
	u, err := GetUserFromContext(c, app)
	if err != nil {
		return err
	}

	var profile User
	c.Bind(&profile)

	profile.ID = u.UID
	profile.Email = u.Email

	p, err := CreateUserProfile(u.UID, &profile)
	if err != nil {
		return c.JSON(500, map[string]string{
			"msg":   "error in creating profile",
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, p)
}
