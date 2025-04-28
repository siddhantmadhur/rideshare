package main

import (
	"fmt"
	"rideshare/internal/server"

	"github.com/labstack/echo/v4"
)

func main() {
	fmt.Println("rideshare")

	e := echo.New()

	server.Routes(e)

	e.Logger.Fatal(e.Start(":8080"))
}
