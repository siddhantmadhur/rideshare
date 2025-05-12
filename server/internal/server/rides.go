package server

import (
	"net/http"
	"rideshare/internal/auth"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func createRidesRoute(c echo.Context, u *auth.User, _ *firebase.App) error {

	return c.JSON(http.StatusNotImplemented, map[string]any{
		"message": "Not implemented",
	})

}
