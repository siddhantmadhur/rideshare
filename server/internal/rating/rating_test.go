package rating_test

import (
	"testing"

	"rideshare/internal/rating"
	"rideshare/internal/storage"

	"gorm.io/gorm"
)

// setupDB drops & re-creates the ratings table in Postgres.
func setupDB(t *testing.T) *gorm.DB {
	db, err := storage.GetConnection()
	if err != nil {
		t.Fatalf("failed to connect to DB: %v", err)
	}
	// Drop & re-migrate so we start clean
	if err := db.Migrator().DropTable(&rating.Rating{}); err != nil {
		t.Fatalf("failed to drop table: %v", err)
	}
	if err := db.AutoMigrate(&rating.Rating{}); err != nil {
		t.Fatalf("failed to migrate table: %v", err)
	}
	return db
}

// Test the full Create → ListDriver/Passenger → GetAverage → Delete flow.
func TestCreateListDeleteAndGetAverage(t *testing.T) {
	// reset schema
	_ = setupDB(t) 

	// 1) insert two reviews for recipient "bob"
	inputs := []*rating.Rating{
		{ReviewerId: "alice", RecipientId: "bob", IsReviewerDriver: true, RideId: 1, Rating: 8, Description: "Great ride"},
		{ReviewerId: "carol", RecipientId: "bob", IsReviewerDriver: false, RideId: 2, Rating: 6, Description: "Smooth trip"},
	}
	for _, r := range inputs {
		if err := rating.CreateReview(r); err != nil {
			t.Fatalf("CreateReview failed: %v", err)
		}
	}

	// 2) ListReviewsByDriver("bob") should return only the driver‐review (alice)
	driverReviews, err := rating.ListReviewsByDriver("bob")
	if err != nil {
		t.Fatalf("ListReviewsByDriver error: %v", err)
	}
	if len(driverReviews) != 1 {
		t.Errorf("expected 1 driver review, got %d", len(driverReviews))
	}

	// 3) ListReviewsByPassenger("bob") should return only the passenger‐review (carol)
	passengerReviews, err := rating.ListReviewsByPassenger("bob")
	if err != nil {
		t.Fatalf("ListReviewsByPassenger error: %v", err)
	}
	if len(passengerReviews) != 1 {
		t.Errorf("expected 1 passenger review, got %d", len(passengerReviews))
	}

	// 4) GetAverageRating("bob") should be (8+6)/2 = 7, count = 2
	avg, count, err := rating.GetAverageRating("bob")
	if err != nil {
		t.Fatalf("GetAverageRating error: %v", err)
	}
	if count != 2 {
		t.Errorf("expected count 2, got %d", count)
	}
	expectedAvg := (8.0 + 6.0) / 2.0
	if avg != expectedAvg {
		t.Errorf("expected average %.1f, got %.1f", expectedAvg, avg)
	}

	// 5) DeleteReview(1) should remove the ride‐1 review
	if err := rating.DeleteReview(1); err != nil {
		t.Fatalf("DeleteReview error: %v", err)
	}
	dr2, _ := rating.ListReviewsByDriver("bob")
	if len(dr2) != 0 {
		t.Errorf("expected 0 driver reviews after delete, got %d", len(dr2))
	}
}
