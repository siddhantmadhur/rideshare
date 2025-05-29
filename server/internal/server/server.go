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

	e.POST("/rating/create", ProtectRouteWithAuth(createReview, app))
	e.DELETE("/rating/delete/:ride_id", ProtectRouteWithAuth(deleteReview, app))
	e.GET("/rating/driver/:recipient_id", ProtectRouteWithAuth(listReviewsByDriver, app))
	e.GET("/rating/passenger/:recipient_id", ProtectRouteWithAuth(listReviewsByPassenger, app))
	e.GET("/rating/average/:recipient_id", ProtectRouteWithAuth(getAverageRating, app))


}
