package queries

import (
	"net/http"
	"github.com/labstack/echo"
	"github.com/dgrijalva/jwt-go"
)

type Response struct {
	Message string `json:"message"`
}

func getUserId(c echo.Context) int64 {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)

	return int64(claims["id"].(float64))
}

func NotImplemented(c echo.Context) error {
	return c.JSON(http.StatusNotImplemented, echo.Map{
		"status":         "error",
		"message":        "Not implemented.",
	})
}
