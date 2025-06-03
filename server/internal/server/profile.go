package server

import (
	"net/http"
	"rideshare/internal/auth"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

type UserDTO struct {
	DisplayName string   `json:"name"`
	Description string   `json:"description"`
	Hobbies     []string `json:"Hobbies"`
}

// Updates user's [rofile inforamtion
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
		Hobbies:     userDTO.Hobbies,
	}

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
