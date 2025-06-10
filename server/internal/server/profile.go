package server

import (
	"fmt"
	"net/http"
	"rideshare/internal/auth"
	"time"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
)

type UserDTO struct {
	DisplayName string         `json:"display_name"`
	Description string         `json:"description"`
	Interests   pq.StringArray `json:"interests"`
	DateOfBirth time.Time      `json:"date_of_birth"`
	Gender      string         `json:"gender"`
	Pronouns    string         `json:"pronouns"`
}

func updateUserProfile(c echo.Context, u *auth.User, _ *firebase.App) error {
	// get info from the request, bind it to a sturct
	userDTO := new(UserDTO)
	if err := c.Bind(userDTO); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{ // error code?
			"msg": "Invalid request",
		})
	}

	updated := &auth.User{
		DisplayName: userDTO.DisplayName,
		Description: userDTO.Description,
		Interests:   userDTO.Interests,
		DateOfBirth: userDTO.DateOfBirth,
		Gender:      userDTO.Gender,
		Pronouns:    userDTO.Pronouns,
	}
	fmt.Printf("Updating user with: %+v\n", updated)

	// update the profile using auth.UpdateUserProfile
	if _, err := auth.UpdateUserProfile(u.ID, updated); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error updating profile",
		})
	}
	return c.JSON(http.StatusOK, map[string]string{
		"msg": "Updated!",
	})
}
