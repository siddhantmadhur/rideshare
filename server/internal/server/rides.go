package server

import (
	"rideshare/internal/auth"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func createRidesRoute(c echo.Context, u *auth.User, _ *firebase.App) error {

	err := auth.CreateUser(u)

	if err != nil {
		return c.JSON(500, map[string]string{
			"message": "there was an error in creating a new user",
		})
	}

	return c.JSON(201, map[string]any{
		"message": "Created new user!",
		"user":    *u,
	})

}
