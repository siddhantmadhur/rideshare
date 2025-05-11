package server

import (
	"context"
	"net/http"
	"rideshare/internal/auth"
	"rideshare/internal/storage"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func ProtectRouteWithAuth(next func(echo.Context, *auth.User, *firebase.App) error, app *firebase.App) echo.HandlerFunc {

	return func(c echo.Context) error {

		reqToken := c.Request().Header.Get("Authorization")
		bearerToken := strings.Split(reqToken, "Bearer ")

		if len(reqToken) == 0 || len(bearerToken) == 0 {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"msg": "Bearer token not detected",
			})
		}

		a, err := app.Auth(context.Background())
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with Firebase",
				"error": err.Error(),
			})
		}

		token, err := a.VerifyIDToken(context.Background(), bearerToken[1])
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with Firebase",
				"error": err.Error(),
			})
		}
		tx, err := storage.GetConnection()
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with connecting to the database",
				"error": err.Error(),
			})
		}

		var u auth.User
		fbUser, err := a.GetUser(context.Background(), token.UID)

		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "Couldn't get the user from firebase",
				"error": err.Error(),
			})
		}

		u.ID = fbUser.UID
		u.DisplayName = fbUser.DisplayName
		res := tx.FirstOrCreate(&u, "id = ?", token.UID)
		if res.Error != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"msg": "User profile has not been created!",
			})
		}

		return next(c, &u, app)
	}
}
