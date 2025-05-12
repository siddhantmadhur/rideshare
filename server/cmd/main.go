package main

import (
	"context"
	"fmt"
	"log"
	"rideshare/internal/auth"
	"rideshare/internal/rides"
	"rideshare/internal/server"
	"rideshare/internal/storage"

	firebase "firebase.google.com/go/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"google.golang.org/api/option"
)

func main() {
	fmt.Println("rideshare")

	// Migrate models
	tx, err := storage.GetConnection()
	if err != nil {
		log.Fatalf("Error in creating connection. Check if server is up!\n")
	}

	tx.AutoMigrate(&auth.User{})
	tx.AutoMigrate(&rides.RideOffer{})

	opt := option.WithCredentialsFile("service-account.json")
	// setup firebase
	app, err := firebase.NewApp(context.Background(), nil, opt)

	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           "${time_custom} [SERVER] ${status} - ${method} ${uri}\n",
		CustomTimeFormat: "2006/01/02 15:04:05",
	}))

	server.Routes(e, app)

	e.Logger.Fatal(e.Start(":8080"))
}
