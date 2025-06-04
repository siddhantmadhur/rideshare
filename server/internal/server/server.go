package server

import (
	"rideshare/internal/auth"

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
	e.PUT("/rides/update", ProtectRouteWithAuth(updateRideOffer, app))
	e.DELETE("/rides/delete/:id", ProtectRouteWithAuth(deleteRideOffer, app))
	e.GET("/rides", ProtectRouteWithAuth(getAllRides, app))
	e.GET("/rides/:id", ProtectRouteWithAuth(getRideByID, app))

	// profile stuff
	e.POST("/user/create", func(c echo.Context) error {
		return auth.CreateProfileRoute(c, app)
	})
	e.POST("/user/update", ProtectRouteWithAuth(updateUserProfile, app))
	e.GET("/user/current", func(c echo.Context) error {
		return auth.GetUserProfileRoute(c, app)
	})

}
