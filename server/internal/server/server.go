package server

import "github.com/labstack/echo/v4"

func Routes(e *echo.Echo) {

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "healthy!",
		})
	})

}
