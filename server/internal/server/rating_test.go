package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"rideshare/internal/auth"
	"rideshare/internal/rating"
	"rideshare/internal/storage"

	"github.com/labstack/echo/v4"
)

// setupDB resets the ratings table before each test
func setupDB(t *testing.T) {
	db, err := storage.GetConnection()
	if err != nil {
		t.Fatalf("DB connection error: %v", err)
	}
	// Drop & re-create schema
	if err := db.Migrator().DropTable(&rating.Rating{}); err != nil {
		t.Fatalf("drop table error: %v", err)
	}
	if err := db.AutoMigrate(&rating.Rating{}); err != nil {
		t.Fatalf("migrate error: %v", err)
	}
}

// execHandler runs an Echo handler without full middleware
func execHandler(req *http.Request, handler func(echo.Context) error) *httptest.ResponseRecorder {
	e := echo.New()
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	if err := handler(c); err != nil {
		e.HTTPErrorHandler(err, c)
	}
	return rec
}

// TestRatingHandlersEndToEnd covers create, list, average, delete, confirm-delete
func TestRatingHandlersEndToEnd(t *testing.T) {
	setupDB(t)

	// 1) Create one review
	payload := map[string]interface{}{
		"reviewer_id":        "alice",
		"recipient_id":       "bob",
		"is_reviewer_driver": true,
		"ride_id":            100,
		"rating":             7,
		"description":        "Nice trip",
	}
	b, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(b))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := execHandler(req, func(c echo.Context) error {
		return createReview(c, &auth.User{ID: "alice"}, nil)
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("createReview returned %d", rec.Code)
	}

	// 2) List as driver
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("bob")
		return listReviewsByDriver(c, &auth.User{ID: "bob"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("listReviewsByDriver returned %d", rec.Code)
	}
	var drivers []rating.Rating
	if err := json.Unmarshal(rec.Body.Bytes(), &drivers); err != nil {
		t.Fatal(err)
	}
	if len(drivers) != 1 {
		t.Errorf("expected 1 driver review, got %d", len(drivers))
	}

	// 3) Get average+count
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("bob")
		return getAverageRating(c, &auth.User{ID: "bob"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("getAverageRating returned %d", rec.Code)
	}
	var avgResp struct {
		Average float64 `json:"average_rating"`
		Count   int     `json:"review_count"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &avgResp); err != nil {
		t.Fatal(err)
	}
	if avgResp.Count != 1 || avgResp.Average != 7.0 {
		t.Errorf("expected average=7.0/count=1, got average=%.1f/count=%d", avgResp.Average, avgResp.Count)
	}

	// 4) Delete
	req = httptest.NewRequest(http.MethodDelete, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("ride_id")
		c.SetParamValues("100")
		return deleteReview(c, &auth.User{ID: "alice"}, nil)
	})
	if rec.Code != http.StatusNoContent {
		t.Fatalf("deleteReview returned %d", rec.Code)
	}

	// 5) Confirm delete
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("bob")
		return listReviewsByDriver(c, &auth.User{ID: "bob"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("post-delete listReviewsByDriver returned %d", rec.Code)
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &drivers); err != nil {
		t.Fatal(err)
	}
	if len(drivers) != 0 {
		t.Errorf("expected 0 driver reviews after delete, got %d", len(drivers))
	}
}

// TestMultipleReviewsAndStats verifies multiple entries and correct splits
func TestMultipleReviewsAndStats(t *testing.T) {
	setupDB(t)

	// insert 3 reviews for 'dave': two driver, one passenger
	revs := []map[string]interface{}{
		{"reviewer_id": "u1", "recipient_id": "dave", "is_reviewer_driver": true,  "ride_id": 1, "rating": 5,  "description": "ok"},
		{"reviewer_id": "u2", "recipient_id": "dave", "is_reviewer_driver": true,  "ride_id": 2, "rating": 7,  "description": "good"},
		{"reviewer_id": "u3", "recipient_id": "dave", "is_reviewer_driver": false, "ride_id": 3, "rating": 10, "description": "excellent"},
	}
	for _, rMap := range revs {
		b, _ := json.Marshal(rMap)
		req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(b))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := execHandler(req, func(c echo.Context) error {
			return createReview(c, &auth.User{ID: rMap["reviewer_id"].(string)}, nil)
		})
		if rec.Code != http.StatusCreated {
			t.Errorf("createReview for %v returned %d", rMap, rec.Code)
		}
	}

	// driver list
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("dave")
		return listReviewsByDriver(c, &auth.User{ID: "dave"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("driver list returned %d", rec.Code)
	}
	var drv []rating.Rating
	if err := json.Unmarshal(rec.Body.Bytes(), &drv); err != nil {
		t.Fatal(err)
	}
	if len(drv) != 2 {
		t.Errorf("expected 2 driver reviews, got %d", len(drv))
	}

	// passenger list
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("dave")
		return listReviewsByPassenger(c, &auth.User{ID: "dave"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("passenger list returned %d", rec.Code)
	}
	var pas []rating.Rating
	if err := json.Unmarshal(rec.Body.Bytes(), &pas); err != nil {
		t.Fatal(err)
	}
	if len(pas) != 1 {
		t.Errorf("expected 1 passenger review, got %d", len(pas))
	}

	// average + count
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("dave")
		return getAverageRating(c, &auth.User{ID: "dave"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("getAverageRating returned %d", rec.Code)
	}
	var stats struct {
		Average float64 `json:"average_rating"`
		Count   int     `json:"review_count"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &stats); err != nil {
		t.Fatal(err)
	}
	if stats.Count != 3 {
		t.Errorf("expected count 3, got %d", stats.Count)
	}
	// average = (5+7+10)/3 ≈ 7.3333
	if stats.Average < 7.33 || stats.Average > 7.34 {
		t.Errorf("average out of range: %.4f", stats.Average)
	}
}

// TestEdgeCases covers empty–state and invalid input
func TestEdgeCases(t *testing.T) {
	setupDB(t)

	// 1) No reviews: list returns empty
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("noone")
		return listReviewsByDriver(c, &auth.User{ID: "noone"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("empty list returned %d", rec.Code)
	}
	var empty []rating.Rating
	if err := json.Unmarshal(rec.Body.Bytes(), &empty); err != nil {
		t.Fatal(err)
	}
	if len(empty) != 0 {
		t.Errorf("expected 0 reviews, got %d", len(empty))
	}

	// 2) No reviews: average=0,count=0
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("recipient_id")
		c.SetParamValues("noone")
		return getAverageRating(c, &auth.User{ID: "noone"}, nil)
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("empty stats returned %d", rec.Code)
	}
	var stats struct {
		Average float64 `json:"average_rating"`
		Count   int     `json:"review_count"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &stats); err != nil {
		t.Fatal(err)
	}
	if stats.Count != 0 || stats.Average != 0 {
		t.Errorf("expected 0/0, got %.1f/%d", stats.Average, stats.Count)
	}

	// 3) Invalid ride_id param → 400 Bad Request
	req = httptest.NewRequest(http.MethodDelete, "/", nil)
	rec = execHandler(req, func(c echo.Context) error {
		c.SetParamNames("ride_id")
		c.SetParamValues("badid")
		return deleteReview(c, &auth.User{ID: "u"}, nil)
	})
	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400 on bad ride_id, got %d", rec.Code)
	}

	// 4) Malformed JSON on create → 400
	req = httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString("{bad json"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = execHandler(req, func(c echo.Context) error {
		return createReview(c, &auth.User{ID: "u"}, nil)
	})
	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400 on malformed JSON, got %d", rec.Code)
	}
}
