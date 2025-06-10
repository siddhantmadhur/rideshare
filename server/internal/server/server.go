package server

import (
	"rideshare/internal/auth"
	"rideshare/internal/rides"

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
	e.GET("/rides", getAllRides)
	e.GET("/rides/user", ProtectRouteWithAuth(getAllUsersRides, app))
	e.GET("/rides/:id", getRideByID)
	//e.POST("/rides/:id/", getRideByID)

	// ride requests
	e.POST("/ride/request/:id/new", ProtectRouteWithAuth(rides.CreateRideRequest, app))                       // id is the ride id
	e.POST("/ride/request/:ride_id/accept/:request_id", ProtectRouteWithAuth(rides.AcceptRideRequest, app))   // id is the request id
	e.POST("/ride/request/:ride_id/decline/:request_id", ProtectRouteWithAuth(rides.DeclineRideRequest, app)) // same as above
	e.POST("/ride/request/:id/delete", ProtectRouteWithAuth(rides.DeleteRideRequest, app))                    // same as above
	e.GET("/ride/request/:id/pending", ProtectRouteWithAuth(rides.GetAllRideRequest, app))                    // same as above
	e.GET("/ride/request/:ride_id/status", ProtectRouteWithAuth(rides.GetRequestCurrentStatus, app))          // same as above

	// profile stuff
	e.POST("/user/create", func(c echo.Context) error {
		return auth.CreateProfileRoute(c, app)
	})
	e.PUT("/user/update", ProtectRouteWithAuth(updateUserProfile, app))
	e.GET("/user/current", func(c echo.Context) error {
		return auth.GetUserProfileRoute(c, app)
	})
	e.GET("/user/information", auth.GetUserProfileFromIdRoute)

}
