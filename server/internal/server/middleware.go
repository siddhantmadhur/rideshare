package server

import (
	"net/http"
	"rideshare/internal/auth"
	"rideshare/internal/storage"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func ProtectRouteWithAuth(next func(echo.Context, *auth.User, *firebase.App) error, app *firebase.App) echo.HandlerFunc {

	return func(c echo.Context) error {

		tx, err := storage.GetConnection()
		defer storage.CloseConnection(tx)
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with connecting to the database",
				"error": err.Error(),
			})
		}

		fbUser, err := auth.GetUserFromContext(c, app)
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with the middleware",
				"error": err.Error(),
			})
		}

		u, err := auth.GetUserProfile(fbUser.UID)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"msg": "User profile has not been created!",
			})
		}

		return next(c, u, app)
	}
}
