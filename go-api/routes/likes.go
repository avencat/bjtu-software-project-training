package routes

import (
	"../queries"
)

func initLikes() {
	Router.DELETE("/likes/:id", queries.DeleteLike)
	Router.GET("/likes", queries.GetLikes)
	Router.POST("/likes", queries.CreateLike)
}
