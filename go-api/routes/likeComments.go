package routes

import (
	"../queries"
)

func initLikeComments() {
	Router.DELETE("/likeComments/:id", queries.DeleteLikeComment)
	Router.GET("/likeComments", queries.GetLikeComments)
	Router.POST("/likeComments", queries.CreateLikeComment)
}
