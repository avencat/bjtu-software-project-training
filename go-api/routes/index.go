package routes

import (
	"../queries"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/labstack/gommon/log"
)

const JwtSecret = "25015c61-030e-452f-a92f-5b8cdb0b627e"

var (
	Router = echo.New()
)

func Init(testing bool) {
	Router.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey: []byte(JwtSecret),
		Skipper: queries.ValidateToken,
		TokenLookup: "header:Authorization",
	}))
	// Middleware
	Router.Use(middleware.CORS())
	if !testing {
		Router.Use(middleware.Logger())
	} else {
		Router.Logger.SetLevel(log.OFF)
	}
	Router.Use(middleware.Recover())
	initUsers()
	initFriendships()
	initPosts()
	initComments()
	initLikeComments()
	initLikes()
}