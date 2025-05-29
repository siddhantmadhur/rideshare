package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"rideshare/internal/auth"
	"rideshare/internal/rides"
	"rideshare/internal/storage"
	"testing"

	"github.com/labstack/echo/v4"
)

func setupEcho() *echo.Echo {
	return echo.New()
}

func mockUser() *auth.User {
	return &auth.User{ID: "test-user-id"}
}

func resetRideOffersForUser(userID string) error {
	db, err := storage.GetConnection()
	if err != nil {
		return err
	}
	result := db.Where("user_id = ?", userID).Delete(&rides.RideOffer{})
	if result.Error != nil {
		return result.Error
	}
	fmt.Printf("Deleted %d ride offers for user %s\n", result.RowsAffected, userID)
	return nil
}

// Helper function to insert mock user into the database
func insertMockUser(userID, displayName string, age int) error {
	db, err := storage.GetConnection()
	if err != nil {
		return err
	}
	user := auth.User{
		ID:          userID,
		DisplayName: displayName,
		Age:         age,
	}
	return db.FirstOrCreate(&user, "id = ?", user.ID).Error
}

func TestCreateRideOffer(t *testing.T) {
	e := setupEcho()

	// Reset ride offers for the user before inserting the mock user - not needed since took out unique uid req for offers?
	// soft deleting, deleted_at column
	if err := resetRideOffersForUser("test-user-id"); err != nil {
		t.Fatalf("Failed to reset ride offers: %v", err)
	}

	// Insert a mock user after resetting the ride offers
	if err := insertMockUser("test-user-id", "Test User", 29); err != nil {
		t.Fatalf("Failed to insert mock user: %v", err)
	}

	// Create a payload for the ride offer
	payload := map[string]any{
		"pickup":  "Santa Clara",
		"dropoff": "San Jose",
		"notes":   "Leaving at 5 PM",
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/rides/create", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Call the create ride offer
	err := createRidesRoute(c, mockUser(), nil)
	if err != nil {
		t.Fatalf("CreateRideOffer failed: %v", err)
	}
	if rec.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", rec.Code)
	}
}

// func TestUpdateRideOffer(t *testing.T) {
// 	e := setupEcho()

// 	// Reset the ride offers for the user before inserting the mock user
// 	if err := resetRideOffersForUser("test-user-id"); err != nil {
// 		t.Fatalf("Failed to reset ride offers: %v", err)
// 	}

// 	// Insert a mock user after resetting the ride offers
// 	if err := insertMockUser("test-user-id", "Test User", 21); err != nil {
// 		t.Fatalf("Failed to insert mock user: %v", err)
// 	}

// 	// Create a ride offer for the user
// 	ride := rides.RideOffer{
// 		Pickup:    "Appa",
// 		Dropoff:   "Baba",
// 		Notes:     "Init",
// 		UserID:    mockUser().ID,
// 		Timestamp: time.Now(),
// 	}
// 	if err := rides.CreateRideOffer(&ride); err != nil {
// 		t.Fatalf("Failed to create ride: %v", err)
// 	}

// 	// Create a payload for the update
// 	updatePayload := map[string]any{
// 		"ID":      ride.ID,
// 		"pickup":  "Appa Updated",
// 		"dropoff": "Baba Updated",
// 		"notes":   "Changed 2",
// 	}
// 	body, _ := json.Marshal(updatePayload)
// 	req := httptest.NewRequest(http.MethodPut, "/rides/update", bytes.NewReader(body))
// 	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
// 	rec := httptest.NewRecorder()
// 	c := e.NewContext(req, rec)

// 	// Call the update ride offer route handler
// 	err := updateRideOffer(c, mockUser(), nil)
// 	if err != nil {
// 		t.Fatalf("UpdateRideOffer failed: %v", err)
// 	}
// 	if rec.Code != http.StatusOK {
// 		t.Errorf("expected 200, got %d", rec.Code)
// 	}
// }

// func TestDeleteRideOffer(t *testing.T) {
// 	e := setupEcho()

// 	// Reset the ride offers for the user before inserting the mock user
// 	if err := resetRideOffersForUser("test-user-id"); err != nil {
// 		t.Fatalf("Failed to reset ride offers: %v", err)
// 	}

// 	// Insert a mock user after resetting the ride offers
// 	if err := insertMockUser("test-user-id", "Test User", 21); err != nil {
// 		t.Fatalf("Failed to insert mock user: %v", err)
// 	}

// 	// Create a ride offer for the user
// 	ride := rides.RideOffer{
// 		Pickup:    "C",
// 		Dropoff:   "D",
// 		UserID:    mockUser().ID,
// 		Timestamp: time.Now(),
// 	}
// 	if err := rides.CreateRideOffer(&ride); err != nil {
// 		t.Fatalf("Failed to create ride: %v", err)
// 	}

// 	// Create a DELETE request to remove the ride offer
// 	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/rides/delete/%d", ride.ID), nil)
// 	rec := httptest.NewRecorder()
// 	c := e.NewContext(req, rec)
// 	c.SetParamNames("id")
// 	c.SetParamValues(fmt.Sprintf("%d", ride.ID))

// 	// Call the delete ride offer route handler
// 	err := deleteRideOffer(c, mockUser(), nil)
// 	if err != nil {
// 		t.Fatalf("DeleteRideOffer failed: %v", err)
// 	}
// 	if rec.Code != http.StatusNoContent {
// 		t.Errorf("expected 204, got %d", rec.Code)
// 	}
// }
