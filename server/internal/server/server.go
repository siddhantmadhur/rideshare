package server

import (
	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func Routes(e *echo.Echo, app *firebase.App) {

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "healthy!",
		})
	})

	e.POST("/rides/create", ProtectRouteWithAuth(createRidesRoute, app))

}
