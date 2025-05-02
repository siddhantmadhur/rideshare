package storage

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

type UserProfile struct {
	gorm.Model
	UserID      uint   `json:"user_id" gorm:"uniqueIndex"`
	Preferences string `json:"preferences"` 
}


type ProfileService struct {
	DB *gorm.DB
}

func NewProfileService() (*ProfileService, error) {
	db, err := GetConnection() 
	if err != nil {
		return nil, err
	}
	
	err = db.AutoMigrate(&UserProfile{})
	if err != nil {
		return nil, err
	}
	
	return &ProfileService{DB: db}, nil
}

