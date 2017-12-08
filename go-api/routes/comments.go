package routes

import (
	"../queries"
)

func initComments() {
	Router.DELETE("/comments/:id", queries.DeleteComment)
	Router.GET("/comments", queries.GetComments)
	Router.POST("/comments", queries.CreateComment)
	Router.GET("/comments/:id", queries.GetComment)
	Router.PUT("/comments/:id", queries.UpdateComment)
}