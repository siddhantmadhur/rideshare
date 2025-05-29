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
		bearerToken := strings.SplitN(reqToken, "Bearer ", 2)

		if reqToken == "" || !strings.HasPrefix(reqToken, "Bearer ") {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"msg": "Bearer token not detected",
			})
		}

		if len(bearerToken) != 2 || strings.TrimSpace(bearerToken[1]) == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"msg": "Bearer token is empty or malformed",
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
		_, err = storage.GetConnection()
		if err != nil {
			return c.JSON(500, map[string]string{
				"msg":   "There was a problem with connecting to the database",
				"error": err.Error(),
			})
		}

		var u auth.User
		u.ID = token.UID

		return next(c, &u, app)
	}
}
