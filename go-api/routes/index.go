package routes

import (
	"../queries"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

const JwtSecret = "25015c61-030e-452f-a92f-5b8cdb0b627e"

var (
	Router = echo.New()
)

func Init() {
	Router.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey: []byte(JwtSecret),
		Skipper: queries.ValidateToken,
		TokenLookup: "header:Authorization",
	}))
	// Middleware
	Router.Use(middleware.CORS())
	Router.Use(middleware.Logger())
	Router.Use(middleware.Recover())
	Router.POST("/profile", queries.NotImplemented)
	initUsers()
	initFriendships()
	initPosts()
	initComments()
	initLikeComments()
	initLikes()
}