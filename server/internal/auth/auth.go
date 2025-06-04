package auth

import (
	"context"
	"errors"
	"rideshare/internal/storage"
	"strings"

	firebase "firebase.google.com/go/v4"
	fbAuth "firebase.google.com/go/v4/auth"
	"github.com/labstack/echo/v4"
)

func CreateUser(u *User) error {
	db, err := storage.GetConnection()
	defer storage.CloseConnection(db)
	if err != nil {
		return err
	}

	return db.FirstOrCreate(u, "id = ?", u.ID).Error
}

func getBearerToken(s string) (string, error) {
	bearerToken := strings.Split(s, "Bearer ")
	if len(s) == 0 || len(bearerToken) < 2 {
		return "", errors.New("Could not get bearer token")
	}

	if len(bearerToken) == 1 {
		return bearerToken[0], nil
	}
	return bearerToken[1], nil
}

func GetUserFromContext(c echo.Context, app *firebase.App) (*fbAuth.UserRecord, error) {

	reqToken := c.Request().Header.Get("Authorization")
	bearerToken, err := getBearerToken(reqToken)

	if err != nil {
		return nil, errors.New("Bearer token not valid")
	}

	a, err := app.Auth(context.Background())
	if err != nil {
		return nil, errors.New("There was a problem with Firebase")
	}

	token, err := a.VerifyIDToken(context.Background(), bearerToken)
	if err != nil {
		return nil, errors.New("There was an issue parsing ID Token")
	}

	fbUser, err := a.GetUser(context.Background(), token.UID)
	return fbUser, err
}
