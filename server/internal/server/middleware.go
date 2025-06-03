package server

import (
	"context"
	"errors"
	"net/http"
	"rideshare/internal/auth"
	"rideshare/internal/storage"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func getBearerToken(s string) (string, error) {
	bearerToken := strings.Split(s, "Bearer ")
	if len(s) == 0 || len(bearerToken) < 2 {
		return "", errors.New("Could not get bearer token")
	}

	if len(bearerToken) == 1 {
		return bearerToken[0], nil
	}
	return bearerToken[1], nil
}

func ProtectRouteWithAuth(next func(echo.Context, *auth.User, *firebase.App) error, app *firebase.App) echo.HandlerFunc {

	return func(c echo.Context) error {

		reqToken := c.Request().Header.Get("Authorization")
		bearerToken, err := getBearerToken(reqToken)

		if err != nil {
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

		token, err := a.VerifyIDToken(context.Background(), bearerToken)
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with Firebase",
				"error": err.Error(),
			})
		}
		tx, err := storage.GetConnection()
		defer storage.CloseConnection(tx)
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with connecting to the database",
				"error": err.Error(),
			})
		}

		fbUser, err := a.GetUser(context.Background(), token.UID)

		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "Couldn't get the user from firebase",
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
