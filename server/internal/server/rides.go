package server

import (
	"rideshare/internal/auth"
	"rideshare/internal/rides"
	"strconv"


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

func updateRideOffer(c echo.Context, u *auth.User, _ *firebase.App) error {
	var r rides.RideOffer
	if err := c.Bind(&r); err != nil {
		return c.JSON(400, map[string]string{"error": "invalid request"})
	}

	r.UserID = u.ID
	err := rides.UpdateRideOffer(&r)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "failed to update ride"})
	}
	return c.JSON(200, r)
}
// hardcode a user pass any pointer, nil for firebase -> make rides_test.go, test for each function
func deleteRideOffer(c echo.Context, u *auth.User, _ *firebase.App) error {
	rideIDStr := c.Param("id")
	rideID, err := strconv.ParseUint(rideIDStr, 10, 64)
	if err != nil {
		return c.JSON(400, map[string]string{"error": "invalid ride ID"})
	}

	err = rides.DeleteRideOffer(uint(rideID))
	if err != nil {
		return c.JSON(500, map[string]string{"error": "failed to delete ride"})
	}
	return c.NoContent(204)
}

func getAllRides(c echo.Context, u *auth.User, _ *firebase.App) error {
	r, err := rides.GetAllRides()
	if err != nil {
		return c.JSON(500, map[string]string{"error": "could not get rides"})
	}
	return c.JSON(200, r)
}
