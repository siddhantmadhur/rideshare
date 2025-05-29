package server

import (
	"net/http"
	"rideshare/internal/auth"
	"rideshare/internal/rating"
	"strconv"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
)

type RatingDTO struct{
	ReviewerId 			string `json:"reviewer_id"`
    RecipientId 		string `json:"recipient_id"`
	IsReviewerDriver 	bool   `json:"is_reviewer_driver"`
    RideId 				int	   `json:"ride_id"`
    Rating				int	   `json:"rating"`
    Description 		string `json:"description"`
}

func createReview (c echo.Context, u *auth.User, _ *firebase.App) error{
	ratingDTO := new(RatingDTO)
	if err := c.Bind(ratingDTO); err != nil{
		return c.JSON(http.StatusBadRequest, map[string] string{
			"msg": "Invalid request",
		})
	}

	newRating := &rating.Rating{
		ReviewerId: ratingDTO.ReviewerId,
		RecipientId: ratingDTO.RecipientId,
		IsReviewerDriver: ratingDTO.IsReviewerDriver,
		RideId: ratingDTO.RideId,
		Rating: ratingDTO.Rating,
		Description: ratingDTO.Description,
	}

	if err:= rating.CreateReview(newRating); err != nil{
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error creating review",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"msg": "Successfully created review",
	})
}

func deleteReview (c echo.Context, u *auth.User, _ *firebase.App) error{
	rideID := c.Param("ride_id")
	if rideID == ""{
		return c.JSON(http.StatusBadRequest, map[string] string{
			"msg": "Invalid request",
		})
	}

	rideIDInt, _ := strconv.Atoi(rideID)

	if err:= rating.DeleteReview(rideIDInt); err != nil{
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error deleting review",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"msg": "Successfully deleted review",
	})
}

func listReviewsByDriver (c echo.Context, u *auth.User, _ *firebase.App) error{
	ID := c.Param("recipient_id")
	if ID == ""{
		return c.JSON(http.StatusBadRequest, map[string] string{
			"msg": "Invalid request",
		})
	}

	ratings, err := rating.ListReviewsByDriver(ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error fetching reviews",
		})
	}
	return c.JSON(http.StatusOK, ratings)
}

func listReviewsByPassenger (c echo.Context, u *auth.User, _ *firebase.App) error{
	ID := c.Param("recipient_id")
	if ID == ""{
		return c.JSON(http.StatusBadRequest, map[string] string{
			"msg": "Invalid request",
		})
	}

	ratings, err := rating.ListReviewsByPassenger(ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error fetching reviews",
		})
	}
	return c.JSON(http.StatusOK, ratings)
}

func getAverageRating (c echo.Context, u *auth.User, _ *firebase.App) error{
	ID := c.Param("recipient_id")
	if ID == ""{
		return c.JSON(http.StatusBadRequest, map[string] string{
			"msg": "Invalid request",
		})
	}

	avgRating, err := rating.GetAverageRating(ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"msg": "Error fetching average rating",
		})
	}
	return c.JSON(http.StatusOK, avgRating)
}