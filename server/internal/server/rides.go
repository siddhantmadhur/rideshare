package server

import (
	"fmt"
	"rideshare/internal/auth"
	"rideshare/internal/rides"
	"strconv"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

func createRidesRoute(c echo.Context, u *auth.User, _ *firebase.App) error {
	fmt.Println("createRidesRoute called")

	// Upsert the user
	if err := auth.CreateUser(&auth.User{
		ID:          u.ID,
		DisplayName: "Firebase User", // or fetch from token.Claims["name"]
	}); err != nil {
		return c.JSON(500, map[string]string{"message": "error creating user"})
	}

	// Bind ride request body
	var ride rides.RideOffer
	if err := c.Bind(&ride); err != nil {
		fmt.Println("❌ Bind error:", err)
		return c.JSON(400, map[string]string{"error": "invalid request body"})
	}

	// Attach UID from Firebase token
	ride.UserID = u.ID

	// Call the DB insert function you wrote
	if err := rides.CreateRideOffer(&ride); err != nil {
		fmt.Println("❌ Failed to insert ride:", err)
		return c.JSON(500, map[string]string{"error": "DB insert failed"})
	}

	fmt.Println("✅ Ride inserted into DB:", ride)
	return c.JSON(201, map[string]string{"message": "Ride created!"})

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

func getRideByID(c echo.Context, u *auth.User, _ *firebase.App) error {
	rideIDStr := c.Param("id")
	rideID, err := strconv.ParseUint(rideIDStr, 10, 64)
	if err != nil {
		return c.JSON(400, map[string]string{"error": "invalid ride ID"})
	}

	ride, err := rides.GetRideByID(uint(rideID))
	if err != nil {
		return c.JSON(500, map[string]string{"error": "cound not get ride with id"})
	}
	return c.JSON(200, ride)

}
